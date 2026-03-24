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
	Series                 *string  `json:"series"`
	PublishedAt            string   `json:"published_at"`
	PageViewsCount         int     `json:"page_views_count"`
	PositiveReactionsCount int     `json:"positive_reactions_count"`
	PublicReactionsCount   int     `json:"public_reactions_count"`
	CommentsCount          int     `json:"comments_count"`
}

// Comment represents a Dev.to comment.
type Comment struct {
	IDCode    string      `json:"id_code"`
	BodyHTML  string      `json:"body_html"`
	User      CommentUser `json:"user"`
	CreatedAt string      `json:"created_at"`
	Children  []Comment   `json:"children"`
}

// CommentUser represents the author of a comment.
type CommentUser struct {
	Username string `json:"username"`
	Name     string `json:"name"`
}

// Tag represents a Dev.to tag from the public tag registry.
type Tag struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	BGColor   string `json:"bg_color_hex"`
	TextColor string `json:"text_color_hex"`
}

// Follower represents a Dev.to follower.
type Follower struct {
	ID           int    `json:"id"`
	UserID       int    `json:"user_id"`
	Name         string `json:"name"`
	Username     string `json:"username"`
	CreatedAt    string `json:"created_at"`
	ProfileImage string `json:"profile_image"`
}

// ArticleUser represents a user in article responses.
type ArticleUser struct {
	Username string `json:"username"`
	Name     string `json:"name"`
}

// ReactionToggle is the request body for toggling a reaction.
type ReactionToggle struct {
	Category      string `json:"category"`
	ReactableID   int    `json:"reactable_id"`
	ReactableType string `json:"reactable_type"`
}

// ReactionResult is the response from toggling a reaction.
type ReactionResult struct {
	Result   string `json:"result"`
	Category string `json:"category"`
	ID       int    `json:"id"`
}

// FollowedTag represents a tag the authenticated user follows.
type FollowedTag struct {
	ID     int     `json:"id"`
	Name   string  `json:"name"`
	Points float64 `json:"points"`
}

// ArticleByTag represents an article returned by the tag-based listing endpoint.
type ArticleByTag struct {
	ID              int         `json:"id"`
	Title           string      `json:"title"`
	URL             string      `json:"url"`
	User            ArticleUser `json:"user"`
	PublicReactions int         `json:"public_reactions_count"`
	PublishedAt     string      `json:"published_at"`
}

// ArticleCreate is the request body for creating/updating articles.
type ArticleCreate struct {
	Article ArticleBody `json:"article"`
}

// Listing represents a Dev.to listing (response).
type Listing struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Category string `json:"category"`
	Slug     string `json:"slug"`
}

// ListingCreate is the request body for creating listings.
type ListingCreate struct {
	Listing ListingBody `json:"listing"`
}

// ListingBody contains the fields for listing create.
type ListingBody struct {
	Title             string   `json:"title"`
	BodyMarkdown      string   `json:"body_markdown"`
	Category          string   `json:"category"`
	Tags              []string `json:"tags,omitempty"`
	ContactViaConnect bool     `json:"contact_via_connect,omitempty"`
}

// ArticleBody contains the fields for create/update.
type ArticleBody struct {
	Title          string   `json:"title"`
	BodyMarkdown   string   `json:"body_markdown"`
	Published      bool     `json:"published"`
	Tags           []string `json:"tags"`
	Description    string   `json:"description,omitempty"`
	CanonicalURL   string   `json:"canonical_url,omitempty"`
	Series         string   `json:"series,omitempty"`
	OrganizationID int      `json:"organization_id,omitempty"`
}
