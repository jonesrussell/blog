package hugo_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
)

func TestParsePost(t *testing.T) {
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "test-post")
	os.MkdirAll(postDir, 0o755)

	content := `---
title: "Test Post"
date: 2026-03-22
tags: ["go", "testing"]
summary: "A test post"
slug: "test-post"
draft: false
devto: true
devto_id: 42
series: ["go-series"]
---

Hello world!
`
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(content), 0o644)

	post, err := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if post.Title != "Test Post" {
		t.Errorf("expected 'Test Post', got %q", post.Title)
	}
	if post.DevtoID != 42 {
		t.Errorf("expected devto_id 42, got %d", post.DevtoID)
	}
	if !post.DevtoEnabled() {
		t.Error("expected devto=true")
	}
	if post.Draft {
		t.Error("expected draft=false")
	}
	if post.Body != "\nHello world!\n" {
		t.Errorf("unexpected body: %q", post.Body)
	}
	if post.Slug != "test-post" {
		t.Errorf("expected slug 'test-post', got %q", post.Slug)
	}
	if len(post.Series) != 1 || post.Series[0] != "go-series" {
		t.Errorf("unexpected series: %v", post.Series)
	}
	if post.Category != "go" {
		t.Errorf("expected category 'go', got %q", post.Category)
	}
}

func TestParsePostDefaultDevto(t *testing.T) {
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "general", "no-devto")
	os.MkdirAll(postDir, 0o755)

	// No devto field — should default to true
	content := `---
title: "No Devto Field"
slug: "no-devto"
draft: false
---

Content.
`
	os.WriteFile(filepath.Join(postDir, "index.md"), []byte(content), 0o644)

	post, err := hugo.ParsePost(filepath.Join(postDir, "index.md"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !post.DevtoEnabled() {
		t.Error("expected devto=true when field is missing")
	}
}

func TestWriteDevtoID(t *testing.T) {
	dir := t.TempDir()
	postDir := filepath.Join(dir, "content", "posts", "go", "test-post")
	os.MkdirAll(postDir, 0o755)

	content := `---
title: "Test Post"
slug: "test-post"
draft: false
devto: true
---

Body here.
`
	filePath := filepath.Join(postDir, "index.md")
	os.WriteFile(filePath, []byte(content), 0o644)

	err := hugo.WriteDevtoID(filePath, 12345)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	post, err := hugo.ParsePost(filePath)
	if err != nil {
		t.Fatalf("failed to re-parse: %v", err)
	}
	if post.DevtoID != 12345 {
		t.Errorf("expected devto_id 12345, got %d", post.DevtoID)
	}
	if post.Title != "Test Post" {
		t.Errorf("title lost during round-trip: %q", post.Title)
	}
}
