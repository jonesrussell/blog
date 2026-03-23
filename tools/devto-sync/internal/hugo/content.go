package hugo

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// Post represents a parsed Hugo blog post.
type Post struct {
	// Frontmatter fields
	Title    string   `yaml:"title"`
	Date     string   `yaml:"date"`
	Tags     []string `yaml:"tags"`
	Summary  string   `yaml:"summary"`
	Slug     string   `yaml:"slug"`
	Draft    bool     `yaml:"draft"`
	Devto    *bool    `yaml:"devto,omitempty"`
	DevtoID  int      `yaml:"devto_id,omitempty"`
	Series   []string `yaml:"series"`
	Archived bool     `yaml:"archived,omitempty"`

	// Derived fields (not in frontmatter)
	Body     string `yaml:"-"`
	FilePath string `yaml:"-"`
	Category string `yaml:"-"` // derived from directory structure

	// Raw frontmatter for round-tripping unknown fields
	RawFrontmatter map[string]interface{} `yaml:"-"`
}

// ShouldSync returns true if this post should be synced to Dev.to.
func (p *Post) ShouldSync() bool {
	return p.DevtoEnabled() && !p.Archived
}

// DevtoEnabled returns true if devto sync is enabled (defaults to true if field is missing).
func (p *Post) DevtoEnabled() bool {
	if p.Devto == nil {
		return true
	}
	return *p.Devto
}

// ParsePost reads and parses a Hugo page bundle index.md file.
func ParsePost(path string) (*Post, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", path, err)
	}

	content := string(data)
	parts := strings.SplitN(content, "---\n", 3)
	if len(parts) < 3 {
		return nil, fmt.Errorf("invalid frontmatter in %s: expected --- delimiters", path)
	}

	frontmatterStr := parts[1]
	body := parts[2]

	var post Post
	if err := yaml.Unmarshal([]byte(frontmatterStr), &post); err != nil {
		return nil, fmt.Errorf("parse frontmatter in %s: %w", path, err)
	}

	// Preserve raw frontmatter for round-tripping
	var raw map[string]interface{}
	if err := yaml.Unmarshal([]byte(frontmatterStr), &raw); err != nil {
		return nil, fmt.Errorf("parse raw frontmatter: %w", err)
	}
	post.RawFrontmatter = raw

	post.Body = body
	post.FilePath = path

	// Derive category from directory structure: content/posts/<category>/<slug>/index.md
	dir := filepath.Dir(path)
	parent := filepath.Dir(dir)
	post.Category = filepath.Base(parent)

	return &post, nil
}

// ListPosts finds all index.md files under the given content directory.
func ListPosts(contentDir string) ([]*Post, error) {
	var posts []*Post
	err := filepath.Walk(contentDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.Name() == "index.md" && !info.IsDir() {
			post, parseErr := ParsePost(path)
			if parseErr != nil {
				return parseErr
			}
			posts = append(posts, post)
		}
		return nil
	})
	return posts, err
}

// WriteDevtoID writes/updates the devto_id field in a post's frontmatter.
func WriteDevtoID(path string, devtoID int) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read %s: %w", path, err)
	}

	content := string(data)
	parts := strings.SplitN(content, "---\n", 3)
	if len(parts) < 3 {
		return fmt.Errorf("invalid frontmatter in %s", path)
	}

	frontmatterStr := parts[1]
	body := parts[2]

	var raw map[string]interface{}
	if err := yaml.Unmarshal([]byte(frontmatterStr), &raw); err != nil {
		return fmt.Errorf("parse frontmatter: %w", err)
	}

	raw["devto_id"] = devtoID

	newFM, err := yaml.Marshal(raw)
	if err != nil {
		return fmt.Errorf("marshal frontmatter: %w", err)
	}

	newContent := "---\n" + string(newFM) + "---\n" + body
	return os.WriteFile(path, []byte(newContent), 0o644)
}

// CreatePageBundle creates a new Hugo page bundle at the given path.
func CreatePageBundle(contentDir, category, slug string, frontmatter map[string]interface{}, body string) (string, error) {
	postDir := filepath.Join(contentDir, category, slug)
	if err := os.MkdirAll(postDir, 0o755); err != nil {
		return "", fmt.Errorf("create directory %s: %w", postDir, err)
	}

	fm, err := yaml.Marshal(frontmatter)
	if err != nil {
		return "", fmt.Errorf("marshal frontmatter: %w", err)
	}

	filePath := filepath.Join(postDir, "index.md")
	content := "---\n" + string(fm) + "---\n" + body
	if err := os.WriteFile(filePath, []byte(content), 0o644); err != nil {
		return "", fmt.Errorf("write %s: %w", filePath, err)
	}
	return filePath, nil
}
