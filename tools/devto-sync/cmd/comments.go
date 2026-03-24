package cmd

import (
	"fmt"
	"os"
	"regexp"
	"strings"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/spf13/cobra"
)

var commentsCmd = &cobra.Command{
	Use:   "comments",
	Short: "Show unanswered comments across articles",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)

		articles, err := client.ListMyArticles()
		if err != nil {
			return fmt.Errorf("list articles: %w", err)
		}

		if len(articles) == 0 {
			fmt.Println("No articles found.")
			return nil
		}

		username := inferUsername(articles)

		type unansweredComment struct {
			articleTitle string
			commenter   string
			date        string
			preview     string
		}

		var unanswered []unansweredComment

		for _, article := range articles {
			if !article.Published || article.CommentsCount == 0 {
				continue
			}

			comments, err := client.ListComments(article.ID)
			if err != nil {
				fmt.Fprintf(os.Stderr, "warning: could not fetch comments for %q: %v\n", article.Title, err)
				continue
			}

			for _, c := range findUnanswered(comments, username) {
				unanswered = append(unanswered, unansweredComment{
					articleTitle: truncate(article.Title, 40),
					commenter:   c.User.Username,
					date:        c.CreatedAt,
					preview:     truncate(stripHTML(c.BodyHTML), 60),
				})
			}
		}

		if len(unanswered) == 0 {
			fmt.Println("No unanswered comments.")
			return nil
		}

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "ARTICLE\tCOMMENTER\tDATE\tPREVIEW")
		fmt.Fprintln(w, "-------\t---------\t----\t-------")
		for _, u := range unanswered {
			fmt.Fprintf(w, "%s\t%s\t%s\t%s\n", u.articleTitle, u.commenter, u.date, u.preview)
		}
		w.Flush()

		fmt.Printf("\n%d unanswered comment(s)\n", len(unanswered))
		return nil
	},
}

func init() {
	rootCmd.AddCommand(commentsCmd)
}

// inferUsername extracts the Dev.to username from the first article's URL.
func inferUsername(articles []devto.Article) string {
	for _, a := range articles {
		// URL format: https://dev.to/username/slug
		parts := strings.Split(strings.TrimPrefix(a.URL, "https://dev.to/"), "/")
		if len(parts) >= 1 && parts[0] != "" {
			return parts[0]
		}
	}
	return ""
}

// findUnanswered returns top-level comments not by the author that have no
// author reply in their children.
func findUnanswered(comments []devto.Comment, username string) []devto.Comment {
	var result []devto.Comment
	for _, c := range comments {
		if strings.EqualFold(c.User.Username, username) {
			continue
		}
		if !hasReplyBy(c.Children, username) {
			result = append(result, c)
		}
	}
	return result
}

func hasReplyBy(children []devto.Comment, username string) bool {
	for _, child := range children {
		if strings.EqualFold(child.User.Username, username) {
			return true
		}
	}
	return false
}

var htmlTagRe = regexp.MustCompile(`<[^>]*>`)

// stripHTML removes HTML tags from a string.
func stripHTML(s string) string {
	return strings.TrimSpace(htmlTagRe.ReplaceAllString(s, ""))
}

