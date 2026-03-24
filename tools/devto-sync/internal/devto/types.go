package devto

import (
	"encoding/json"
	"strings"
)

// FlexTags handles Dev.to's inconsistent tag_list field:
// array of strings in list endpoints, comma-separated string in create/update responses.
type FlexTags []string

// UnmarshalJSON handles both string and []string JSON values.
func (ft *FlexTags) UnmarshalJSON(data []byte) error {
	// Try array first
	var arr []string
	if err := json.Unmarshal(data, &arr); err == nil {
		*ft = arr
		return nil
	}
	// Fall back to comma-separated string
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	if s == "" {
		*ft = nil
		return nil
	}
	tags := strings.Split(s, ", ")
	*ft = tags
	return nil
}

// Article represents a Dev.to article (response).
type Article struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Published    bool     `json:"published"`
	URL          string   `json:"url"`
	CanonicalURL string   `json:"canonical_url"`
	Slug         string   `json:"slug"`
	BodyMarkdown string   `json:"body_markdown"`
	Tags         FlexTags `json:"tag_list"`
	Series       *string  `json:"series"`
	PublishedAt             string   `json:"published_at"`
	PageViewsCount         int      `json:"page_views_count"`
	PositiveReactionsCount int      `json:"positive_reactions_count"`
	PublicReactionsCount   int      `json:"public_reactions_count"`
	CommentsCount          int      `json:"comments_count"`
}

// ArticleCreate is the request body for creating/updating articles.
type ArticleCreate struct {
	Article ArticleBody `json:"article"`
}

// ArticleBody contains the fields for create/update.
type ArticleBody struct {
	Title        string   `json:"title"`
	BodyMarkdown string   `json:"body_markdown"`
	Published    bool     `json:"published"`
	Tags         []string `json:"tags"`
	Description  string   `json:"description,omitempty"`
	CanonicalURL string   `json:"canonical_url,omitempty"`
	Series       string   `json:"series,omitempty"`
}
