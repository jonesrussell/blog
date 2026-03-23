package sync_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
)

func TestPushNewPost(t *testing.T) {
	var receivedReq devto.ArticleCreate
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			json.NewDecoder(r.Body).Decode(&receivedReq)
			resp := devto.Article{ID: 99, Title: receivedReq.Article.Title}
			json.NewEncoder(w).Encode(resp)
			return
		}
		w.WriteHeader(404)
	}))
	defer srv.Close()

	// Create a test post
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "new-post")
	os.MkdirAll(postDir, 0o755)
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(`---
title: "New Post"
slug: "new-post"
tags: ["go"]
summary: "A new post"
draft: false
devto: true
---

Hello Dev.to!
`), 0o644)

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	engine := devsync.NewEngine(client, "https://jonesrussell.github.io/blog")

	post, _ := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	result, err := engine.PushPost(post, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != 99 {
		t.Errorf("expected ID 99, got %d", result.ID)
	}
	if receivedReq.Article.CanonicalURL != "https://jonesrussell.github.io/blog/new-post/" {
		t.Errorf("unexpected canonical URL: %s", receivedReq.Article.CanonicalURL)
	}
	if !receivedReq.Article.Published {
		t.Error("expected published=true for non-draft post")
	}
}

func TestPushExistingPost(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "PUT" && r.URL.Path == "/api/articles/42" {
			resp := devto.Article{ID: 42, Title: "Updated"}
			json.NewEncoder(w).Encode(resp)
			return
		}
		w.WriteHeader(404)
	}))
	defer srv.Close()

	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "existing")
	os.MkdirAll(postDir, 0o755)
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(`---
title: "Existing Post"
slug: "existing"
draft: false
devto: true
devto_id: 42
---

Updated content.
`), 0o644)

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	engine := devsync.NewEngine(client, "https://jonesrussell.github.io/blog")

	post, _ := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	result, err := engine.PushPost(post, false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != 42 {
		t.Errorf("expected ID 42, got %d", result.ID)
	}
}

func TestPushDryRun(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("API should not be called during dry run")
	}))
	defer srv.Close()

	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "dry-run")
	os.MkdirAll(postDir, 0o755)
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(`---
title: "Dry Run Post"
slug: "dry-run"
draft: false
devto: true
---

Content.
`), 0o644)

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	engine := devsync.NewEngine(client, "https://jonesrussell.github.io/blog")

	post, _ := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	result, err := engine.PushPost(post, true) // dry-run=true
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != nil {
		t.Error("expected nil result for dry run")
	}
}
