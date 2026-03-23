package devto

// Article represents a Dev.to article (response).
// Note: Dev.to returns tags differently per endpoint:
//   - List endpoints (/articles/me/all): "tag_list" is a comma-separated string
//   - Single article (/articles/{id}): "tags" is an array
//
// We use Tags (tag_list) for list responses since that's our primary read path.
// For pull (single article), parse Tags string with splitTags().
type Article struct {
	ID           int     `json:"id"`
	Title        string  `json:"title"`
	Description  string  `json:"description"`
	Published    bool    `json:"published"`
	URL          string  `json:"url"`
	CanonicalURL string  `json:"canonical_url"`
	Slug         string  `json:"slug"`
	BodyMarkdown string  `json:"body_markdown"`
	Tags         string  `json:"tag_list"`     // comma-separated string (list endpoints)
	Series       *string `json:"series"`       // nullable
	PublishedAt  string  `json:"published_at"`
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
