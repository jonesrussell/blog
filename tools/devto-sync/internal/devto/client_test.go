package devto_test

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
)

func TestListMyArticles(t *testing.T) {
	articles := []devto.Article{
		{ID: 1, Title: "Test Post", Published: true},
		{ID: 2, Title: "Draft Post", Published: false},
	}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("api-key") != "test-key" {
			t.Errorf("expected api-key header, got %q", r.Header.Get("api-key"))
		}
		if r.URL.Path != "/api/articles/me/all" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		// Return articles on page 1, empty on page 2+ to stop pagination
		page := r.URL.Query().Get("page")
		if page == "" || page == "1" {
			json.NewEncoder(w).Encode(articles)
		} else {
			json.NewEncoder(w).Encode([]devto.Article{})
		}
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	result, err := client.ListMyArticles()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("expected 2 articles, got %d", len(result))
	}
	if result[0].Title != "Test Post" {
		t.Errorf("expected 'Test Post', got %q", result[0].Title)
	}
}

func TestCreateArticle(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}
		var req devto.ArticleCreate
		json.NewDecoder(r.Body).Decode(&req)
		resp := devto.Article{
			ID:    42,
			Title: req.Article.Title,
			URL:   "https://dev.to/test/post-42",
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	result, err := client.CreateArticle(devto.ArticleCreate{
		Article: devto.ArticleBody{
			Title:        "New Post",
			BodyMarkdown: "Hello world",
			Published:    true,
			Tags:         []string{"go", "testing"},
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.ID != 42 {
		t.Errorf("expected ID 42, got %d", result.ID)
	}
}

func TestUpdateArticle(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "PUT" {
			t.Errorf("expected PUT, got %s", r.Method)
		}
		if r.URL.Path != "/api/articles/42" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		resp := devto.Article{ID: 42, Title: "Updated Post"}
		json.NewEncoder(w).Encode(resp)
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	result, err := client.UpdateArticle(42, devto.ArticleCreate{
		Article: devto.ArticleBody{Title: "Updated Post", BodyMarkdown: "Updated", Published: true},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Title != "Updated Post" {
		t.Errorf("expected 'Updated Post', got %q", result.Title)
	}
}

func TestAPIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(422)
		w.Write([]byte(`{"error":"Title is too short"}`))
	}))
	defer srv.Close()

	client := devto.NewClient("test-key", devto.WithBaseURL(srv.URL))
	_, err := client.CreateArticle(devto.ArticleCreate{
		Article: devto.ArticleBody{Title: "X"},
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	var apiErr *devto.APIError
	if !errors.As(err, &apiErr) {
		t.Fatalf("expected *APIError, got %T", err)
	}
	if apiErr.StatusCode != 422 {
		t.Errorf("expected 422, got %d", apiErr.StatusCode)
	}
}
