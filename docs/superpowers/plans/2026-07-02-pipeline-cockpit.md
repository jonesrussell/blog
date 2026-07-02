# Pipeline Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A read-only Go dashboard on the Pi showing content-queue funnel, Buffer queue depth, mining-run health, and recently shipped items — per `docs/superpowers/specs/2026-07-02-pipeline-cockpit-design.md`.

**Architecture:** One Go binary: three in-process pollers (GitHub issues, GitHub Actions, Buffer GraphQL) write to a mutex-guarded in-memory snapshot; a stdlib HTTP server renders it as server-side HTML (+ `/api/state.json`, `/healthz`). Deployed as a compose service in `waaseyaa-infra` behind Caddy basic auth on the existing Cloudflare Tunnel.

**Tech Stack:** Go 1.24, stdlib (`net/http`, `html/template`, `embed`, `log/slog`), testify for tests, Taskfile, golangci-lint. No Uber FX (deliberate — see spec). No JS build step.

## Global Constraints

- Module path: `github.com/jonesrussell/pipeline-cockpit`; local checkout at `~/dev/pipeline-cockpit`; repo `jonesrussell/pipeline-cockpit` (private).
- Go 1.24+; `any` not `interface{}`; no magic numbers (named consts); cognitive complexity ≤ 20 (golangci-lint gate).
- Only external dependency allowed: `github.com/stretchr/testify`.
- The service is READ-ONLY: it must never call any mutating GitHub or Buffer endpoint.
- Secrets only via env vars; never log token values.
- Infra follows existing `waaseyaa-infra` patterns exactly: image `pipeline-cockpit:local` built on the Pi (NOT GHCR — deviation from spec, matching observed `compose/docker-compose.yml` pattern), Caddy basic-auth via the gitignored `compose/caddy/secrets/*.env` mechanism used by the rhtcircle cockpit (Caddyfile ~L208-224).
- GitHub data source repo: `jonesrussell/jonesrussell`. Buffer endpoint: `https://api.buffer.com` (POST GraphQL). Free-tier cap: 10 scheduled posts/channel; warn threshold 9.
- Stage labels: `stage:mined`, `stage:curated`, `stage:in_production`, `stage:ready`, `stage:distributed`; shortlist label `curate:keep`; queue label `content-queue`.
- Commit after every green test cycle. Conventional-commit style messages.

---

### Task 1: Repo scaffold + snapshot package

**Files:**
- Create: `~/dev/pipeline-cockpit/go.mod`, `Taskfile.yml`, `.golangci.yml`, `.gitignore`
- Create: `internal/snapshot/snapshot.go`
- Test: `internal/snapshot/snapshot_test.go`

**Interfaces:**
- Produces (used by every later task): package `snapshot` types `Snapshot`, `IssuesData`, `ActionsData`, `BufferData`, `SourceMeta`, `Item`, `ShippedItem`, `WorkflowRun`, `ChannelQueue`; `NewStore() *Store`; methods `Get() Snapshot`, `SetIssues(IssuesData)`, `SetActions(ActionsData)`, `SetBuffer(BufferData)`, `SetIssuesError(string)`, `SetActionsError(string)`, `SetBufferError(string)`.

- [ ] **Step 1: Scaffold**

```bash
mkdir -p ~/dev/pipeline-cockpit && cd ~/dev/pipeline-cockpit && git init -b main
go mod init github.com/jonesrussell/pipeline-cockpit
go get github.com/stretchr/testify@latest
printf 'bin/\n.env\n' > .gitignore
```

`Taskfile.yml`:

```yaml
version: '3'
tasks:
  dev:
    cmds: [go run . ]
  build:
    cmds: [CGO_ENABLED=0 go build -o bin/pipeline-cockpit .]
  test:
    cmds: [go test ./...]
  lint:
    cmds: [golangci-lint run, go vet ./...]
```

`.golangci.yml`:

```yaml
linters:
  enable: [govet, staticcheck, errcheck, gocognit, mnd]
linters-settings:
  gocognit:
    min-complexity: 20
```

- [ ] **Step 2: Write failing store test** (`internal/snapshot/snapshot_test.go`)

```go
package snapshot

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestStoreSetAndGet(t *testing.T) {
	s := NewStore()
	now := time.Date(2026, 7, 2, 12, 0, 0, 0, time.UTC)
	s.SetIssues(IssuesData{
		Meta:   SourceMeta{FetchedAt: now},
		Funnel: map[string]int{"stage:mined": 30},
	})
	got := s.Get()
	assert.Equal(t, 30, got.Issues.Funnel["stage:mined"])
	assert.Equal(t, now, got.Issues.Meta.FetchedAt)
	assert.Empty(t, got.Issues.Meta.LastError)
}

func TestSetIssuesErrorPreservesData(t *testing.T) {
	s := NewStore()
	now := time.Date(2026, 7, 2, 12, 0, 0, 0, time.UTC)
	s.SetIssues(IssuesData{Meta: SourceMeta{FetchedAt: now}, Funnel: map[string]int{"stage:ready": 2}})
	s.SetIssuesError("github: 502")
	got := s.Get()
	assert.Equal(t, 2, got.Issues.Funnel["stage:ready"], "old data must survive an error")
	assert.Equal(t, now, got.Issues.Meta.FetchedAt, "FetchedAt reflects last GOOD fetch")
	assert.Equal(t, "github: 502", got.Issues.Meta.LastError)
}

func TestSetIssuesClearsError(t *testing.T) {
	s := NewStore()
	s.SetIssuesError("boom")
	s.SetIssues(IssuesData{Meta: SourceMeta{FetchedAt: time.Now(), LastError: ""}})
	assert.Empty(t, s.Get().Issues.Meta.LastError)
}
```

- [ ] **Step 3: Run to verify failure** — `go test ./internal/snapshot/` → FAIL (types undefined).

- [ ] **Step 4: Implement** (`internal/snapshot/snapshot.go`)

```go
// Package snapshot holds the dashboard's single in-memory state and its types.
package snapshot

import (
	"sync"
	"time"
)

type SourceMeta struct {
	FetchedAt time.Time `json:"fetched_at"`
	LastError string    `json:"last_error,omitempty"`
}

type Item struct {
	Number     int     `json:"number"`
	Title      string  `json:"title"`
	Stage      string  `json:"stage"`
	Confidence float64 `json:"confidence,omitempty"`
	AgeDays    int     `json:"age_days"`
	Keep       bool    `json:"keep"`
	Stuck      bool    `json:"stuck"`
	URL        string  `json:"url"`
}

type ShippedItem struct {
	Number   int       `json:"number"`
	Title    string    `json:"title"`
	ClosedAt time.Time `json:"closed_at"`
	BlogURL  string    `json:"blog_url,omitempty"`
	URL      string    `json:"url"`
}

type IssuesData struct {
	Meta    SourceMeta     `json:"meta"`
	Funnel  map[string]int `json:"funnel"`
	Items   []Item         `json:"items"`
	Shipped []ShippedItem  `json:"shipped"`
}

type WorkflowRun struct {
	Workflow   string        `json:"workflow"`
	Status     string        `json:"status"`
	Conclusion string        `json:"conclusion"`
	StartedAt  time.Time     `json:"started_at"`
	Duration   time.Duration `json:"duration"`
	HTMLURL    string        `json:"html_url"`
}

type ActionsData struct {
	Meta SourceMeta    `json:"meta"`
	Runs []WorkflowRun `json:"runs"`
}

type ChannelQueue struct {
	Name    string      `json:"name"`
	Pending int         `json:"pending"`
	HasMore bool        `json:"has_more"` // pagination hit: render as "10+"
	DueAt   []time.Time `json:"due_at"`
}

type BufferData struct {
	Meta     SourceMeta     `json:"meta"`
	Channels []ChannelQueue `json:"channels"`
}

type Snapshot struct {
	Issues  IssuesData  `json:"issues"`
	Actions ActionsData `json:"actions"`
	Buffer  BufferData  `json:"buffer"`
}

// Store is the single shared state. Writers replace whole sections, so
// readers may safely use the returned value without copying.
type Store struct {
	mu   sync.RWMutex
	snap Snapshot
}

func NewStore() *Store { return &Store{} }

func (s *Store) Get() Snapshot {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.snap
}

func (s *Store) SetIssues(d IssuesData)   { s.mu.Lock(); s.snap.Issues = d; s.mu.Unlock() }
func (s *Store) SetActions(d ActionsData) { s.mu.Lock(); s.snap.Actions = d; s.mu.Unlock() }
func (s *Store) SetBuffer(d BufferData)   { s.mu.Lock(); s.snap.Buffer = d; s.mu.Unlock() }

// Set*Error records a fetch failure while preserving the last good data.
func (s *Store) SetIssuesError(msg string)  { s.mu.Lock(); s.snap.Issues.Meta.LastError = msg; s.mu.Unlock() }
func (s *Store) SetActionsError(msg string) { s.mu.Lock(); s.snap.Actions.Meta.LastError = msg; s.mu.Unlock() }
func (s *Store) SetBufferError(msg string)  { s.mu.Lock(); s.snap.Buffer.Meta.LastError = msg; s.mu.Unlock() }
```

- [ ] **Step 5: Verify pass** — `go test ./internal/snapshot/ -v` → PASS (3 tests). Also `go test -race ./internal/snapshot/`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: scaffold + snapshot store"`

---

### Task 2: GitHub issues — derivation logic + client

**Files:**
- Create: `internal/github/issues.go`, `internal/github/client.go`
- Create: `internal/github/testdata/issues_open.json`, `internal/github/testdata/issues_closed.json`
- Test: `internal/github/issues_test.go`

**Interfaces:**
- Consumes: `snapshot.IssuesData`, `snapshot.Item`, `snapshot.ShippedItem`, `snapshot.SourceMeta` (Task 1).
- Produces: `github.NewClient(token, repo, baseURL string) *Client`; `(*Client) FetchIssues(ctx context.Context, now time.Time) (snapshot.IssuesData, error)`; pure `BuildIssuesData(open, closed []Issue, now time.Time) snapshot.IssuesData`; exported `Issue` struct (below).

- [ ] **Step 1: Failing derivation test** (`internal/github/issues_test.go`)

```go
package github

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func lbl(names ...string) []Label {
	out := make([]Label, len(names))
	for i, n := range names {
		out[i] = Label{Name: n}
	}
	return out
}

func TestBuildIssuesData(t *testing.T) {
	now := time.Date(2026, 7, 2, 12, 0, 0, 0, time.UTC)
	old := now.AddDate(0, 0, -20)
	fresh := now.AddDate(0, 0, -2)
	closedAt := now.AddDate(0, 0, -1)

	open := []Issue{
		{Number: 1073, Title: "minoo src/Provider", Body: "**Confidence:** 1.0\n**Repo:** waaseyaa/minoo",
			HTMLURL: "https://github.com/jonesrussell/jonesrussell/issues/1073",
			CreatedAt: old, UpdatedAt: old, Labels: lbl("content-queue", "stage:mined", "curate:keep")},
		{Number: 900, Title: "stuck one", CreatedAt: old, UpdatedAt: old,
			Labels: lbl("content-queue", "stage:curated")},
		{Number: 901, Title: "fresh ready", CreatedAt: fresh, UpdatedAt: fresh,
			Labels: lbl("content-queue", "stage:ready")},
	}
	closed := []Issue{
		{Number: 800, Title: "shipped post", ClosedAt: &closedAt,
			Body: "live at https://jonesrussell.github.io/blog/some-post/ now",
			HTMLURL: "https://github.com/jonesrussell/jonesrussell/issues/800",
			Labels: lbl("content-queue", "stage:distributed")},
	}

	d := BuildIssuesData(open, closed, now)

	assert.Equal(t, 1, d.Funnel["stage:mined"])
	assert.Equal(t, 1, d.Funnel["stage:curated"])
	assert.Equal(t, 1, d.Funnel["stage:ready"])
	assert.Equal(t, 0, d.Funnel["stage:in_production"])

	require.Len(t, d.Items, 3)
	byNum := map[int]int{}
	for i, it := range d.Items {
		byNum[it.Number] = i
	}
	keep := d.Items[byNum[1073]]
	assert.True(t, keep.Keep)
	assert.InDelta(t, 1.0, keep.Confidence, 0.001)
	assert.Equal(t, 20, keep.AgeDays)
	assert.False(t, keep.Stuck, "mined items are never 'stuck'")

	assert.True(t, d.Items[byNum[900]].Stuck, "working stage + updated >7d ago = stuck")
	assert.False(t, d.Items[byNum[901]].Stuck)

	require.Len(t, d.Shipped, 1)
	assert.Equal(t, "https://jonesrussell.github.io/blog/some-post/", d.Shipped[0].BlogURL)
	assert.Equal(t, closedAt, d.Shipped[0].ClosedAt)
}

func TestBuildIssuesDataSortsItemsByConfidenceDesc(t *testing.T) {
	now := time.Now()
	open := []Issue{
		{Number: 1, Title: "low", Body: "**Confidence:** 0.7", CreatedAt: now, UpdatedAt: now, Labels: lbl("stage:mined")},
		{Number: 2, Title: "high", Body: "**Confidence:** 1.0", CreatedAt: now, UpdatedAt: now, Labels: lbl("stage:mined")},
		{Number: 3, Title: "none", CreatedAt: now, UpdatedAt: now, Labels: lbl("stage:mined")},
	}
	d := BuildIssuesData(open, nil, now)
	assert.Equal(t, []int{2, 1, 3}, []int{d.Items[0].Number, d.Items[1].Number, d.Items[2].Number})
}
```

- [ ] **Step 2: Run to fail** — `go test ./internal/github/` → FAIL (undefined `Issue`, `BuildIssuesData`).

- [ ] **Step 3: Implement derivation** (`internal/github/issues.go`)

```go
package github

import (
	"regexp"
	"sort"
	"strconv"
	"time"

	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
)

type Label struct {
	Name string `json:"name"`
}

// Issue mirrors the fields we use from the GitHub REST issues API.
type Issue struct {
	Number    int        `json:"number"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	HTMLURL   string     `json:"html_url"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	ClosedAt  *time.Time `json:"closed_at"`
	Labels    []Label    `json:"labels"`
}

const (
	stuckAfterDays = 7
	hoursPerDay    = 24
)

var (
	confidenceRe = regexp.MustCompile(`\*\*Confidence:\*\*\s*([0-9.]+)`)
	blogURLRe    = regexp.MustCompile(`https://jonesrussell\.github\.io/blog/[^\s)"'<>]+`)
	stageLabels  = []string{"stage:mined", "stage:curated", "stage:in_production", "stage:ready"}
	workingStage = map[string]bool{"stage:curated": true, "stage:in_production": true, "stage:ready": true}
)

func hasLabel(is Issue, name string) bool {
	for _, l := range is.Labels {
		if l.Name == name {
			return true
		}
	}
	return false
}

func stageOf(is Issue) string {
	for _, s := range stageLabels {
		if hasLabel(is, s) {
			return s
		}
	}
	return ""
}

func confidenceOf(body string) float64 {
	m := confidenceRe.FindStringSubmatch(body)
	if m == nil {
		return 0
	}
	v, err := strconv.ParseFloat(m[1], 64)
	if err != nil {
		return 0
	}
	return v
}

// BuildIssuesData derives the dashboard view from raw issues. Pure function.
func BuildIssuesData(open, closed []Issue, now time.Time) snapshot.IssuesData {
	d := snapshot.IssuesData{
		Meta:   snapshot.SourceMeta{FetchedAt: now},
		Funnel: map[string]int{},
	}
	for _, s := range stageLabels {
		d.Funnel[s] = 0
	}
	for _, is := range open {
		stage := stageOf(is)
		if stage == "" {
			continue
		}
		d.Funnel[stage]++
		item := snapshot.Item{
			Number:     is.Number,
			Title:      is.Title,
			Stage:      stage,
			Confidence: confidenceOf(is.Body),
			AgeDays:    int(now.Sub(is.CreatedAt).Hours() / hoursPerDay),
			Keep:       hasLabel(is, "curate:keep"),
			Stuck:      workingStage[stage] && now.Sub(is.UpdatedAt).Hours() > stuckAfterDays*hoursPerDay,
			URL:        is.HTMLURL,
		}
		d.Items = append(d.Items, item)
	}
	sort.SliceStable(d.Items, func(i, j int) bool { return d.Items[i].Confidence > d.Items[j].Confidence })

	for _, is := range closed {
		sh := snapshot.ShippedItem{Number: is.Number, Title: is.Title, URL: is.HTMLURL}
		if is.ClosedAt != nil {
			sh.ClosedAt = *is.ClosedAt
		}
		if m := blogURLRe.FindString(is.Body); m != "" {
			sh.BlogURL = m
		}
		d.Shipped = append(d.Shipped, sh)
	}
	return d
}
```

- [ ] **Step 4: Verify pass** — `go test ./internal/github/ -v` → PASS.

- [ ] **Step 5: Failing client test (httptest, pagination)** — append to `issues_test.go`:

```go
func TestFetchIssuesPaginatesAndSplits(t *testing.T) {
	calls := []string{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls = append(calls, r.URL.String())
		assert.Equal(t, "Bearer tok", r.Header.Get("Authorization"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.URL.Query().Get("state") == "closed":
			http.ServeFile(w, r, "testdata/issues_closed.json")
		case r.URL.Query().Get("page") == "2":
			w.Write([]byte("[]")) // empty page ends pagination
		default:
			http.ServeFile(w, r, "testdata/issues_open.json")
		}
	}))
	defer srv.Close()

	c := NewClient("tok", "jonesrussell/jonesrussell", srv.URL)
	d, err := c.FetchIssues(context.Background(), time.Now())
	require.NoError(t, err)
	assert.NotEmpty(t, d.Items)
	assert.NotEmpty(t, d.Shipped)
	assert.GreaterOrEqual(t, len(calls), 3, "page 1, page 2, closed")
}
```

Add imports: `context`, `net/http`, `net/http/httptest`.

Create `testdata/issues_open.json` — 2 realistic open issues (one `stage:mined`+`curate:keep` with a `**Confidence:** 0.9` body, one `stage:ready`), full field set as returned by `GET /repos/{repo}/issues` (number, title, body, html_url, created_at, updated_at, labels as `{"name": ...}` objects). Create `testdata/issues_closed.json` — 1 closed issue with `stage:distributed` label, `closed_at`, and a blog URL in the body. Copy realistic shapes from `gh api 'repos/jonesrussell/jonesrussell/issues?labels=content-queue&per_page=2'` output (strip to used fields).

- [ ] **Step 6: Run to fail** — undefined `NewClient`.

- [ ] **Step 7: Implement client** (`internal/github/client.go`)

```go
package github

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
)

const (
	defaultBaseURL = "https://api.github.com"
	perPage        = 100
	maxPages       = 5
	shippedCount   = 10
	httpTimeout    = 20 * time.Second
)

type Client struct {
	token   string
	repo    string
	baseURL string
	http    *http.Client
}

func NewClient(token, repo, baseURL string) *Client {
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	return &Client{token: token, repo: repo, baseURL: baseURL, http: &http.Client{Timeout: httpTimeout}}
}

func (c *Client) getJSON(ctx context.Context, path string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Accept", "application/vnd.github+json")
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return fmt.Errorf("github %s: %s: %s", path, resp.Status, body)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func (c *Client) FetchIssues(ctx context.Context, now time.Time) (snapshot.IssuesData, error) {
	var open []Issue
	for page := 1; page <= maxPages; page++ {
		var batch []Issue
		p := fmt.Sprintf("/repos/%s/issues?labels=content-queue&state=open&per_page=%d&page=%d", c.repo, perPage, page)
		if err := c.getJSON(ctx, p, &batch); err != nil {
			return snapshot.IssuesData{}, err
		}
		open = append(open, batch...)
		if len(batch) < perPage {
			break
		}
	}
	var closed []Issue
	p := fmt.Sprintf("/repos/%s/issues?labels=content-queue,stage:distributed&state=closed&per_page=%d&sort=updated&direction=desc", c.repo, shippedCount)
	if err := c.getJSON(ctx, p, &closed); err != nil {
		return snapshot.IssuesData{}, err
	}
	return BuildIssuesData(open, closed, now), nil
}
```

- [ ] **Step 8: Verify pass** — `go test ./internal/github/ -v` → PASS all.
- [ ] **Step 9: Commit** — `git add -A && git commit -m "feat: github issues client + funnel derivation"`

---

### Task 3: GitHub Actions runs client

**Files:**
- Modify: `internal/github/client.go` (append)
- Create: `internal/github/actions.go`, `internal/github/testdata/workflow_runs.json`
- Test: `internal/github/actions_test.go`

**Interfaces:**
- Produces: `(*Client) FetchRuns(ctx context.Context, workflows []string, now time.Time) (snapshot.ActionsData, error)`. Callers pass `[]string{"content-mine.yml", "content-queue-hygiene.yml"}`.

- [ ] **Step 1: Failing test** (`internal/github/actions_test.go`)

```go
package github

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFetchRuns(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Contains(t, r.URL.Path, "/actions/workflows/")
		http.ServeFile(w, r, "testdata/workflow_runs.json")
	}))
	defer srv.Close()

	c := NewClient("tok", "jonesrussell/jonesrussell", srv.URL)
	d, err := c.FetchRuns(context.Background(), []string{"content-mine.yml"}, time.Now())
	require.NoError(t, err)
	require.Len(t, d.Runs, 1)
	run := d.Runs[0]
	assert.Equal(t, "content-mine.yml", run.Workflow)
	assert.Equal(t, "success", run.Conclusion)
	assert.Equal(t, "completed", run.Status)
	assert.Equal(t, 3*time.Minute, run.Duration)
	assert.Equal(t, "https://github.com/jonesrussell/jonesrussell/actions/runs/1", run.HTMLURL)
}
```

`testdata/workflow_runs.json`:

```json
{
  "workflow_runs": [
    {
      "status": "completed",
      "conclusion": "success",
      "run_started_at": "2026-07-02T11:00:00Z",
      "updated_at": "2026-07-02T11:03:00Z",
      "html_url": "https://github.com/jonesrussell/jonesrussell/actions/runs/1"
    }
  ]
}
```

- [ ] **Step 2: Run to fail** — undefined `FetchRuns`.

- [ ] **Step 3: Implement** (`internal/github/actions.go`)

```go
package github

import (
	"context"
	"fmt"
	"time"

	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
)

type workflowRunsResp struct {
	WorkflowRuns []struct {
		Status       string    `json:"status"`
		Conclusion   string    `json:"conclusion"`
		RunStartedAt time.Time `json:"run_started_at"`
		UpdatedAt    time.Time `json:"updated_at"`
		HTMLURL      string    `json:"html_url"`
	} `json:"workflow_runs"`
}

// FetchRuns returns the latest run of each named workflow file. A workflow
// with no runs (or a 404) contributes a zero-value entry rather than failing
// the whole fetch.
func (c *Client) FetchRuns(ctx context.Context, workflows []string, now time.Time) (snapshot.ActionsData, error) {
	d := snapshot.ActionsData{Meta: snapshot.SourceMeta{FetchedAt: now}}
	var firstErr error
	for _, wf := range workflows {
		var resp workflowRunsResp
		p := fmt.Sprintf("/repos/%s/actions/workflows/%s/runs?per_page=1", c.repo, wf)
		if err := c.getJSON(ctx, p, &resp); err != nil {
			if firstErr == nil {
				firstErr = err
			}
			d.Runs = append(d.Runs, snapshot.WorkflowRun{Workflow: wf, Status: "unknown", Conclusion: "fetch-error"})
			continue
		}
		run := snapshot.WorkflowRun{Workflow: wf, Status: "no-runs"}
		if len(resp.WorkflowRuns) > 0 {
			r := resp.WorkflowRuns[0]
			run = snapshot.WorkflowRun{
				Workflow:   wf,
				Status:     r.Status,
				Conclusion: r.Conclusion,
				StartedAt:  r.RunStartedAt,
				Duration:   r.UpdatedAt.Sub(r.RunStartedAt),
				HTMLURL:    r.HTMLURL,
			}
		}
		d.Runs = append(d.Runs, run)
	}
	return d, firstErr
}
```

- [ ] **Step 4: Verify pass**, then **Step 5: Commit** — `git commit -am "feat: actions runs client"`

---

### Task 4: Buffer GraphQL client

**Files:**
- Create: `internal/buffer/buffer.go`, `internal/buffer/testdata/posts_scheduled.json`, `internal/buffer/testdata/channel_org.json`
- Test: `internal/buffer/buffer_test.go`

**Interfaces:**
- Produces: `buffer.NewClient(apiKey, baseURL string, channels []buffer.Channel) *Client`; `type Channel struct { Name, ID string }`; `(*Client) FetchQueues(ctx context.Context, now time.Time) (snapshot.BufferData, error)`.
- The GraphQL queries below are copied from the verified-working `~/.claude/skills/content-pipeline/buffer-queue-status.sh` — do not "improve" them.

- [ ] **Step 1: Failing test** (`internal/buffer/buffer_test.go`)

```go
package buffer

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFetchQueues(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "Bearer key", r.Header.Get("Authorization"))
		var body struct{ Query string `json:"query"` }
		require.NoError(t, json.NewDecoder(r.Body).Decode(&body))
		w.Header().Set("Content-Type", "application/json")
		if strings.Contains(body.Query, "organizationId }") { // channel lookup
			http.ServeFile(w, r, "testdata/channel_org.json")
			return
		}
		http.ServeFile(w, r, "testdata/posts_scheduled.json")
	}))
	defer srv.Close()

	c := NewClient("key", srv.URL, []Channel{{Name: "bluesky", ID: "ch1"}, {Name: "linkedin", ID: "ch2"}})
	d, err := c.FetchQueues(context.Background(), time.Now())
	require.NoError(t, err)
	require.Len(t, d.Channels, 2)
	assert.Equal(t, "bluesky", d.Channels[0].Name)
	assert.Equal(t, 2, d.Channels[0].Pending)
	assert.False(t, d.Channels[0].HasMore)
	require.Len(t, d.Channels[0].DueAt, 2)
	assert.Equal(t, 2026, d.Channels[0].DueAt[0].Year())
}

func TestFetchQueuesHasNextPageMeansTenPlus(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var body struct{ Query string `json:"query"` }
		_ = json.NewDecoder(r.Body).Decode(&body)
		if strings.Contains(body.Query, "organizationId }") {
			http.ServeFile(w, r, "testdata/channel_org.json")
			return
		}
		w.Write([]byte(`{"data":{"posts":{"edges":[{"node":{"dueAt":"2026-07-03T10:00:00Z"}}],"pageInfo":{"hasNextPage":true}}}}`))
	}))
	defer srv.Close()
	c := NewClient("key", srv.URL, []Channel{{Name: "facebook", ID: "ch3"}})
	d, err := c.FetchQueues(context.Background(), time.Now())
	require.NoError(t, err)
	assert.True(t, d.Channels[0].HasMore)
}

func TestFetchQueuesGraphQLError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Write([]byte(`{"errors":[{"message":"unauthorized"}]}`))
	}))
	defer srv.Close()
	c := NewClient("key", srv.URL, []Channel{{Name: "facebook", ID: "ch3"}})
	_, err := c.FetchQueues(context.Background(), time.Now())
	require.Error(t, err)
	assert.Contains(t, err.Error(), "unauthorized")
}
```

`testdata/channel_org.json`:

```json
{"data": {"channel": {"organizationId": "org123"}}}
```

`testdata/posts_scheduled.json`:

```json
{"data": {"posts": {"edges": [
  {"node": {"dueAt": "2026-07-03T10:00:00Z"}},
  {"node": {"dueAt": "2026-07-04T10:00:00Z"}}
], "pageInfo": {"hasNextPage": false}}}}
```

- [ ] **Step 2: Run to fail**, then **Step 3: Implement** (`internal/buffer/buffer.go`)

```go
// Package buffer reads scheduled-post queue depth from the Buffer GraphQL API.
// Query shapes are copied from the verified buffer-queue-status.sh — the
// posts query requires an organizationId, resolved once via a channel lookup.
package buffer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
)

const (
	defaultBaseURL = "https://api.buffer.com"
	pageSize       = 10 // free-tier cap; hasNextPage=true renders as "10+"
	httpTimeout    = 20 * time.Second
)

type Channel struct {
	Name string
	ID   string
}

type Client struct {
	apiKey   string
	baseURL  string
	channels []Channel
	http     *http.Client
	orgID    string
}

func NewClient(apiKey, baseURL string, channels []Channel) *Client {
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	return &Client{apiKey: apiKey, baseURL: baseURL, channels: channels, http: &http.Client{Timeout: httpTimeout}}
}

func (c *Client) gql(ctx context.Context, query string, out any) error {
	payload, err := json.Marshal(map[string]string{"query": query})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	var envelope struct {
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}
	if err := json.Unmarshal(body, &envelope); err != nil {
		return fmt.Errorf("buffer: bad response: %w", err)
	}
	if len(envelope.Errors) > 0 {
		return fmt.Errorf("buffer graphql: %s", envelope.Errors[0].Message)
	}
	return json.Unmarshal(body, out)
}

func (c *Client) resolveOrgID(ctx context.Context) (string, error) {
	if c.orgID != "" {
		return c.orgID, nil
	}
	var resp struct {
		Data struct {
			Channel struct {
				OrganizationID string `json:"organizationId"`
			} `json:"channel"`
		} `json:"data"`
	}
	q := fmt.Sprintf(`{ channel(input: { id: %q }) { organizationId } }`, c.channels[0].ID)
	if err := c.gql(ctx, q, &resp); err != nil {
		return "", err
	}
	if resp.Data.Channel.OrganizationID == "" {
		return "", fmt.Errorf("buffer: empty organizationId")
	}
	c.orgID = resp.Data.Channel.OrganizationID
	return c.orgID, nil
}

func (c *Client) FetchQueues(ctx context.Context, now time.Time) (snapshot.BufferData, error) {
	d := snapshot.BufferData{Meta: snapshot.SourceMeta{FetchedAt: now}}
	orgID, err := c.resolveOrgID(ctx)
	if err != nil {
		return d, err
	}
	for _, ch := range c.channels {
		var resp struct {
			Data struct {
				Posts struct {
					Edges []struct {
						Node struct {
							DueAt time.Time `json:"dueAt"`
						} `json:"node"`
					} `json:"edges"`
					PageInfo struct {
						HasNextPage bool `json:"hasNextPage"`
					} `json:"pageInfo"`
				} `json:"posts"`
			} `json:"data"`
		}
		q := fmt.Sprintf(`{
  posts(
    input: { organizationId: %q, filter: { channelIds: [%q], status: scheduled } }
    first: %d
  ) {
    ... on PostsResults {
      edges { node { dueAt } }
      pageInfo { hasNextPage }
    }
  }
}`, orgID, ch.ID, pageSize)
		if err := c.gql(ctx, q, &resp); err != nil {
			return d, fmt.Errorf("channel %s: %w", ch.Name, err)
		}
		cq := snapshot.ChannelQueue{
			Name:    ch.Name,
			Pending: len(resp.Data.Posts.Edges),
			HasMore: resp.Data.Posts.PageInfo.HasNextPage,
		}
		for _, e := range resp.Data.Posts.Edges {
			cq.DueAt = append(cq.DueAt, e.Node.DueAt)
		}
		d.Channels = append(d.Channels, cq)
	}
	return d, nil
}
```

- [ ] **Step 4: Verify pass** — `go test ./internal/buffer/ -v` → PASS (3 tests).
- [ ] **Step 5: Commit** — `git commit -am "feat: buffer queue client"`

---

### Task 5: Web server + dashboard template + demo fixtures

**Files:**
- Create: `internal/web/server.go`, `internal/web/templates/dashboard.html.tmpl`
- Create: `internal/demo/demo.go`
- Test: `internal/web/server_test.go`

**Interfaces:**
- Consumes: `snapshot.Store.Get()` (Task 1).
- Produces: `web.New(store *snapshot.Store) (*web.Server, error)`; `(*Server) Routes() http.Handler` serving `GET /`, `GET /api/state.json`, `GET /healthz`; `demo.Snapshot() snapshot.Snapshot` (a fully populated fixture used by DEMO mode and tests).

- [ ] **Step 1: Failing tests** (`internal/web/server_test.go`)

```go
package web

import (
	"net/http/httptest"
	"testing"

	"github.com/jonesrussell/pipeline-cockpit/internal/demo"
	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func demoServer(t *testing.T) *Server {
	t.Helper()
	store := snapshot.NewStore()
	snap := demo.Snapshot()
	store.SetIssues(snap.Issues)
	store.SetActions(snap.Actions)
	store.SetBuffer(snap.Buffer)
	s, err := New(store)
	require.NoError(t, err)
	return s
}

func TestDashboardRenders(t *testing.T) {
	s := demoServer(t)
	rec := httptest.NewRecorder()
	s.Routes().ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	require.Equal(t, 200, rec.Code)
	body := rec.Body.String()
	for _, marker := range []string{"Queue funnel", "Buffer", "Mining", "Recently shipped", "stage:mined"} {
		assert.Contains(t, body, marker)
	}
}

func TestStateJSON(t *testing.T) {
	s := demoServer(t)
	rec := httptest.NewRecorder()
	s.Routes().ServeHTTP(rec, httptest.NewRequest("GET", "/api/state.json", nil))
	require.Equal(t, 200, rec.Code)
	assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))
	assert.Contains(t, rec.Body.String(), `"funnel"`)
}

func TestHealthz(t *testing.T) {
	s := demoServer(t)
	rec := httptest.NewRecorder()
	s.Routes().ServeHTTP(rec, httptest.NewRequest("GET", "/healthz", nil))
	assert.Equal(t, 200, rec.Code)
}

func TestBufferTenPlusRendering(t *testing.T) {
	store := snapshot.NewStore()
	snap := demo.Snapshot()
	snap.Buffer.Channels[0].HasMore = true
	store.SetBuffer(snap.Buffer)
	store.SetIssues(snap.Issues)
	store.SetActions(snap.Actions)
	s, err := New(store)
	require.NoError(t, err)
	rec := httptest.NewRecorder()
	s.Routes().ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))
	assert.Contains(t, rec.Body.String(), "10+")
}
```

- [ ] **Step 2: Implement demo fixtures** (`internal/demo/demo.go`) — a `Snapshot()` returning: funnel `{mined: 30, curated: 2, in_production: 0, ready: 1}`; 5 items (mix of keep/stuck, confidences 1.0→0.7, realistic titles like "waaseyaa/minoo: src/Provider work"); 3 Buffer channels (facebook 3 pending, bluesky 0, linkedin 8 with 8 due dates); 2 workflow runs (content-mine.yml success 2m, content-queue-hygiene.yml success 30s); 3 shipped items with blog URLs. All timestamps relative to `time.Now()` so ages render sensibly. Complete code required — no stub.

- [ ] **Step 3: Implement server** (`internal/web/server.go`)

```go
package web

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"

	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
)

//go:embed templates/dashboard.html.tmpl
var tmplFS embed.FS

const (
	capPerChannel = 10
	warnThreshold = 9
	staleAfter    = 30 * time.Minute
)

type Server struct {
	store *snapshot.Store
	tmpl  *template.Template
}

func New(store *snapshot.Store) (*Server, error) {
	funcs := template.FuncMap{
		"ago": func(t time.Time) string {
			if t.IsZero() {
				return "never"
			}
			d := time.Since(t).Round(time.Minute)
			return d.String() + " ago"
		},
		"date":    func(t time.Time) string { return t.Format("2006-01-02") },
		"pending": func(c snapshot.ChannelQueue) string {
			if c.HasMore {
				return fmt.Sprintf("%d+", capPerChannel)
			}
			return fmt.Sprintf("%d", c.Pending)
		},
		"atCap": func(c snapshot.ChannelQueue) bool { return c.HasMore || c.Pending >= warnThreshold },
	}
	tmpl, err := template.New("dashboard.html.tmpl").Funcs(funcs).ParseFS(tmplFS, "templates/dashboard.html.tmpl")
	if err != nil {
		return nil, err
	}
	return &Server{store: store, tmpl: tmpl}, nil
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", s.handleDashboard)
	mux.HandleFunc("GET /api/state.json", s.handleState)
	mux.HandleFunc("GET /healthz", s.handleHealthz)
	return mux
}

func (s *Server) handleDashboard(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmpl.Execute(w, s.store.Get()); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (s *Server) handleState(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(s.store.Get())
}

func (s *Server) handleHealthz(w http.ResponseWriter, _ *http.Request) {
	snap := s.store.Get()
	out := map[string]any{
		"ok":            true,
		"issues_stale":  time.Since(snap.Issues.Meta.FetchedAt) > staleAfter,
		"actions_stale": time.Since(snap.Actions.Meta.FetchedAt) > staleAfter,
		"buffer_stale":  time.Since(snap.Buffer.Meta.FetchedAt) > staleAfter,
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(out)
}
```

- [ ] **Step 4: Template** (`internal/web/templates/dashboard.html.tmpl`) — single dark-theme page, inline `<style>`, `<meta http-equiv="refresh" content="60">`, four `<section>`s in this order with these exact `<h2>` headings (the test asserts them): `Queue funnel`, `Buffer`, `Mining`, `Recently shipped`.
  - Funnel: one row per stage in pipeline order (`stage:mined → stage:curated → stage:in_production → stage:ready`) with count; below it a table of `.Issues.Items` (number linked to `.URL`, title, stage, confidence, age, ★ if `.Keep`, red "STUCK" badge if `.Stuck`); cap rows shown to 20 with `{{if gt (len .Issues.Items) 20}}…and N more{{end}}`.
  - Buffer: table per channel — name, `{{pending .}}`/10 (red class when `{{atCap .}}`), up to 5 due dates via `{{date}}`.
  - Mining: table of `.Actions.Runs` — workflow, conclusion (green `success` / red otherwise), `{{ago .StartedAt}}`, duration, link "view".
  - Recently shipped: list of `.Shipped` — title linking to `.BlogURL` when set else `.URL`, `{{date .ClosedAt}}`.
  - Every section footer: `<small>as of {{ago .Meta.FetchedAt}}{{with .Meta.LastError}} — error: {{.}}{{end}}</small>` (adjust dot-scope per section: e.g. `{{with .Issues}}...{{end}}`).
  - Simple CSS: max-width 960px, system font stack, `background:#111;color:#ddd`, tables `border-collapse:collapse` with 1px `#333` borders, `.bad{color:#f66}`, `.good{color:#6d6}`.

- [ ] **Step 5: Verify pass** — `go test ./internal/web/ -v` → PASS (4 tests).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: web server, dashboard template, demo fixtures"`

---

### Task 6: Poller + config + main

**Files:**
- Create: `internal/poll/poll.go`, `main.go`
- Test: `internal/poll/poll_test.go`

**Interfaces:**
- Consumes: everything above.
- Produces: `poll.Run(ctx context.Context, name string, interval time.Duration, logger *slog.Logger, fn func(context.Context) error)` — calls `fn` immediately, then every `interval`; logs (never propagates) errors; returns when ctx is done.

- [ ] **Step 1: Failing poll test** (`internal/poll/poll_test.go`)

```go
package poll

import (
	"context"
	"errors"
	"log/slog"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestRunCallsImmediatelyThenOnInterval(t *testing.T) {
	var calls atomic.Int32
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Millisecond)
	defer cancel()
	Run(ctx, "test", 50*time.Millisecond, slog.Default(), func(context.Context) error {
		calls.Add(1)
		return nil
	})
	assert.GreaterOrEqual(t, calls.Load(), int32(2), "immediate call + at least one tick")
}

func TestRunSurvivesErrors(t *testing.T) {
	var calls atomic.Int32
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Millisecond)
	defer cancel()
	Run(ctx, "test", 50*time.Millisecond, slog.Default(), func(context.Context) error {
		calls.Add(1)
		return errors.New("boom")
	})
	assert.GreaterOrEqual(t, calls.Load(), int32(2), "errors must not stop the loop")
}
```

- [ ] **Step 2: Implement** (`internal/poll/poll.go`)

```go
// Package poll runs a fetch function on a fixed interval until ctx is done.
package poll

import (
	"context"
	"log/slog"
	"time"
)

func Run(ctx context.Context, name string, interval time.Duration, logger *slog.Logger, fn func(context.Context) error) {
	tick := func() {
		if err := fn(ctx); err != nil {
			logger.Warn("poll failed", "source", name, "error", err)
		}
	}
	tick()
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			tick()
		}
	}
}
```

- [ ] **Step 3: Verify pass** — `go test ./internal/poll/ -v`.

- [ ] **Step 4: main.go**

```go
package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jonesrussell/pipeline-cockpit/internal/buffer"
	"github.com/jonesrussell/pipeline-cockpit/internal/demo"
	gh "github.com/jonesrussell/pipeline-cockpit/internal/github"
	"github.com/jonesrussell/pipeline-cockpit/internal/poll"
	"github.com/jonesrussell/pipeline-cockpit/internal/snapshot"
	"github.com/jonesrussell/pipeline-cockpit/internal/web"
)

const (
	issuesInterval  = 2 * time.Minute
	actionsInterval = 10 * time.Minute
	bufferInterval  = 5 * time.Minute
	sourceRepo      = "jonesrussell/jonesrussell"
)

var trackedWorkflows = []string{"content-mine.yml", "content-queue-hygiene.yml"}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	store := snapshot.NewStore()

	addr := os.Getenv("LISTEN_ADDR")
	if addr == "" {
		addr = ":8090"
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if os.Getenv("DEMO") == "1" {
		snap := demo.Snapshot()
		store.SetIssues(snap.Issues)
		store.SetActions(snap.Actions)
		store.SetBuffer(snap.Buffer)
		logger.Info("DEMO mode: serving fixture data, pollers disabled")
	} else {
		token := mustEnv(logger, "GITHUB_TOKEN")
		apiKey := mustEnv(logger, "BUFFER_API_KEY")
		channels := []buffer.Channel{
			{Name: "facebook", ID: mustEnv(logger, "BUFFER_CHANNEL_FACEBOOK")},
			{Name: "bluesky", ID: mustEnv(logger, "BUFFER_CHANNEL_BLUESKY")},
			{Name: "linkedin", ID: mustEnv(logger, "BUFFER_CHANNEL_LINKEDIN")},
		}
		ghc := gh.NewClient(token, sourceRepo, "")
		bfc := buffer.NewClient(apiKey, "", channels)

		go poll.Run(ctx, "issues", issuesInterval, logger, func(ctx context.Context) error {
			d, err := ghc.FetchIssues(ctx, time.Now())
			if err != nil {
				store.SetIssuesError(err.Error())
				return err
			}
			store.SetIssues(d)
			return nil
		})
		go poll.Run(ctx, "actions", actionsInterval, logger, func(ctx context.Context) error {
			d, err := ghc.FetchRuns(ctx, trackedWorkflows, time.Now())
			if err != nil {
				store.SetActionsError(err.Error())
			}
			if len(d.Runs) > 0 {
				store.SetActions(d)
			}
			return err
		})
		go poll.Run(ctx, "buffer", bufferInterval, logger, func(ctx context.Context) error {
			d, err := bfc.FetchQueues(ctx, time.Now())
			if err != nil {
				store.SetBufferError(err.Error())
				return err
			}
			store.SetBuffer(d)
			return nil
		})
	}

	srv, err := web.New(store)
	if err != nil {
		logger.Error("template init failed", "error", err)
		os.Exit(1)
	}
	httpSrv := &http.Server{Addr: addr, Handler: srv.Routes(), ReadHeaderTimeout: 5 * time.Second}
	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = httpSrv.Shutdown(shutdownCtx)
	}()
	logger.Info("listening", "addr", addr)
	if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server exited", "error", err)
		os.Exit(1)
	}
}

func mustEnv(logger *slog.Logger, key string) string {
	v := os.Getenv(key)
	if v == "" {
		logger.Error("missing required env var", "key", key)
		os.Exit(1)
	}
	return v
}
```

- [ ] **Step 5: Verify manually** — `DEMO=1 go run . &` then `curl -s localhost:8090/healthz` → JSON with `"ok":true`; `curl -s localhost:8090/ | grep -c '<section'` → 4; kill it. Run full suite: `go test ./... && go vet ./...` → all PASS.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: pollers, config, main wiring"`

---

### Task 7: Dockerfile, CI, create GitHub repo

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml`, `README.md`

**Interfaces:**
- Produces: image `pipeline-cockpit:local` buildable on ARM64 (the Pi builds it; CI does NOT publish images — matches waaseyaa-infra's `:local` pattern).

- [ ] **Step 1: Dockerfile**

```dockerfile
FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /pipeline-cockpit .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /pipeline-cockpit /pipeline-cockpit
EXPOSE 8090
ENTRYPOINT ["/pipeline-cockpit"]
```

`.dockerignore`: `bin/`, `.git/`, `*.md`.

- [ ] **Step 2: Verify image** — `docker build -t pipeline-cockpit:local . && docker run --rm -e DEMO=1 -p 8090:8090 -d pipeline-cockpit:local && sleep 2 && curl -sf localhost:8090/healthz` → JSON; stop container.

- [ ] **Step 3: CI** (`.github/workflows/ci.yml`) — on push/PR to main: setup-go 1.24, `go test ./...`, `go vet ./...`, golangci-lint-action. No docker publish.

- [ ] **Step 4: README** — one screenful: what it is, env vars table (from spec), `task dev`/`DEMO=1`, deploy pointer to `waaseyaa-infra/runbooks/08-pipeline-cockpit.md`.

- [ ] **Step 5: Create repo + push**

```bash
gh repo create jonesrussell/pipeline-cockpit --private --source ~/dev/pipeline-cockpit --push
gh run watch --repo jonesrussell/pipeline-cockpit --exit-status $(gh run list --repo jonesrussell/pipeline-cockpit -L1 --json databaseId -q '.[0].databaseId')
```

Expected: CI green. Commit any fixes needed.

---

### Task 8: waaseyaa-infra — vault, compose, Caddy, runbook

**Files (all in `~/dev/waaseyaa-infra`):**
- Modify: `ansible/group_vars/all/vault.yml` (via `ansible-vault`), `compose/docker-compose.yml`, `compose/caddy/Caddyfile`
- Create: `runbooks/08-pipeline-cockpit.md`, plus a basic-auth secrets env following the existing `compose/caddy/secrets/cockpit.env` mechanism (gitignored)

**Interfaces:**
- Consumes: image `pipeline-cockpit:local` (Task 7); env var names from Task 6 (`GITHUB_TOKEN`, `BUFFER_API_KEY`, `BUFFER_CHANNEL_FACEBOOK/_BLUESKY/_LINKEDIN`, `LISTEN_ADDR`).
- **USER ACTION REQUIRED (blocking):** a fine-grained GitHub PAT, read-only Issues + Actions on `jonesrussell/jonesrussell`, must be created in the GitHub web UI (Settings → Developer settings → Fine-grained tokens). The agent cannot create PATs. Pause and ask the user for it; store it with `ansible-vault` as `vault_pipeline_cockpit_github_token`. Until provided, complete every other step and template a placeholder that fails loudly at container start (`mustEnv` exits).

- [ ] **Step 1: Read before writing** — study `compose/docker-compose.yml` service pattern (image `:local`, `container_name`, networks, restart policy, how env/secrets reach services — check `ansible/playbook.yml` for how group_vars are templated to the Pi), the Caddyfile cockpit block (~L208-224: `@cockpit_bare` redirect + `handle_path` + `basic_auth` + secrets env), and `runbooks/07-rhtcircle-deploy-no-actions.md` for deploy conventions. Mirror them exactly; where this plan's snippets differ from observed patterns, the repo's patterns win.

- [ ] **Step 2: Vault additions** (no values printed):

```bash
# add via a merge script like the one used for the buffer keys (decrypt to scratchpad, append, re-encrypt, verify key names)
vault_pipeline_cockpit_github_token: "<PAT from user, or PLACEHOLDER_ASK_USER>"
vault_pipeline_cockpit_basicauth_user: "jones"
vault_pipeline_cockpit_basicauth_hash: "<bcrypt from: docker run --rm caddy:2-alpine caddy hash-password --plaintext '<generated 24-char random password>'>"
```

Record the generated plaintext password ONLY in the final report to the user, never in git.

- [ ] **Step 3: Compose service** (adapt to observed pattern):

```yaml
  pipeline-cockpit:
    image: pipeline-cockpit:local
    container_name: pipeline-cockpit
    restart: unless-stopped
    environment:
      GITHUB_TOKEN: "{{ vault_pipeline_cockpit_github_token }}"
      BUFFER_API_KEY: "{{ vault_buffer_api_key }}"
      BUFFER_CHANNEL_FACEBOOK: "{{ vault_buffer_channel_facebook }}"
      BUFFER_CHANNEL_BLUESKY: "{{ vault_buffer_channel_bluesky }}"
      BUFFER_CHANNEL_LINKEDIN: "{{ vault_buffer_channel_linkedin }}"
```

(If compose is NOT ansible-templated, use whatever secret-injection mechanism the other services use — env_file, etc. Follow the repo.)

- [ ] **Step 4: Caddy route** — mirror the cockpit block on the most appropriate existing internal hostname (choose after reading the Caddyfile/cloudflared config; prefer the same host as the rhtcircle cockpit unless a cleaner internal host exists):

```
    @pipeline_bare path /pipeline
    redir @pipeline_bare /pipeline/ permanent
    handle_path /pipeline/* {
        basic_auth {
            {$PIPELINE_COCKPIT_USER} {$PIPELINE_COCKPIT_HASH}
        }
        reverse_proxy pipeline-cockpit:8090
    }
```

Wire `PIPELINE_COCKPIT_USER`/`_HASH` through the same secrets-env mechanism as `cockpit.env`. NOTE: the app renders root-relative links; since `handle_path` strips `/pipeline`, verify the dashboard's internal links (`/api/state.json`) work under the prefix — if not, set the template's links relative (`api/state.json`) instead; the template task used absolute paths, so change them to relative here and upstream in the pipeline-cockpit repo (one-line template fix + commit).

- [ ] **Step 5: Runbook** (`runbooks/08-pipeline-cockpit.md`): source repo, how the Pi gets the code (`git clone git@github.com:jonesrussell/pipeline-cockpit.git /srv/src/pipeline-cockpit` or repo-convention path), build (`docker build -t pipeline-cockpit:local /srv/src/pipeline-cockpit`), `docker compose up -d pipeline-cockpit && docker compose restart caddy`, URL, how to rotate the PAT (60-day expiry if set; note expiry date), troubleshooting (healthz, `docker logs pipeline-cockpit`).

- [ ] **Step 6: Commit + push** waaseyaa-infra (`git add` the specific files; commit "feat: pipeline-cockpit service (dashboard on the Pi)"; push — repo is private).

---

### Task 9: Deploy to the Pi + verify

**Files:** none new (runbook execution).

- [ ] **Step 1: Reachability** — `cd ~/dev/waaseyaa-infra && ansible -i ansible/inventory.yml all -m ping`. If unreachable, STOP: report that deploy is runbook-ready and hand the runbook to the user.
- [ ] **Step 2: Execute the runbook** over SSH/ansible: clone/pull the repo on the Pi, `docker build`, run the ansible playbook (or manual compose steps per runbook), restart caddy.
- [ ] **Step 3: Verify** — from the dev machine: `curl -sf -u 'jones:<password>' https://<host>/pipeline/healthz` → 200 JSON; `curl -sf -u ... https://<host>/pipeline/ | grep -c '<section'` → 4; confirm the Buffer panel shows real counts (compare with `~/.claude/skills/content-pipeline/buffer-queue-status.sh` output) and the funnel shows ~30 mined. If the PAT was still a placeholder, verify the container fails loudly with "missing required env var GITHUB_TOKEN" and report that state.
- [ ] **Step 4: Report** — URL, credentials location, PAT status, and any deviations.

---

## Self-Review Notes

- Spec coverage: pollers/panels (Tasks 2–6), state.json + healthz (5), DEMO (5, 6), no-FX + stdlib (global), infra + basic auth + runbook (8), deploy/verify (9). Deviation from spec recorded: local image build instead of GHCR (matches infra reality); CI is test/lint only.
- Known user-blocking dependency: the fine-grained PAT (Task 8) — everything else proceeds around it.
- Type consistency: `snapshot.*` names used identically in Tasks 2–6; `web.New(store *snapshot.Store)`; `demo.Snapshot() snapshot.Snapshot`.
