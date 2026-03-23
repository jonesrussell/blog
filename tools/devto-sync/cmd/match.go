package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	"github.com/spf13/cobra"
)

var matchCmd = &cobra.Command{
	Use:   "match",
	Short: "Find Dev.to articles matching unlinked blog posts (by canonical URL or title)",
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

		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		// Find posts without devto_id
		for _, post := range posts {
			if post.DevtoID > 0 || !post.ShouldSync() {
				continue
			}

			canonical := fmt.Sprintf("%s/%s/", baseURL, post.Slug)

			// Try canonical URL match
			for _, a := range articles {
				if a.CanonicalURL == canonical {
					fmt.Printf("CANONICAL\t%s\t%d\t%s\n", post.Slug, a.ID, a.Title)
					goto next
				}
			}

			// Try title match
			for _, a := range articles {
				if strings.EqualFold(a.Title, post.Title) {
					fmt.Printf("TITLE\t%s\t%d\t%s\n", post.Slug, a.ID, a.Title)
					goto next
				}
			}

			fmt.Printf("NONE\t%s\t0\tno match found\n", post.Slug)
		next:
		}
		return nil
	},
}

func init() {
	rootCmd.AddCommand(matchCmd)
}
