package cmd

import (
	"fmt"
	"os"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/spf13/cobra"
)

var (
	engageLimit int
	engageDays  int
)

var engageCmd = &cobra.Command{
	Use:   "engage",
	Short: "Like recent articles in tags you follow",
	Long:  "Fetches your followed tags, finds recent articles in each, and likes them to boost community engagement.",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)

		// Fetch own article IDs to filter them out of engagement results.
		myArticles, err := client.ListMyArticles()
		if err != nil {
			return fmt.Errorf("fetch own articles: %w", err)
		}
		myArticleIDs := make(map[int]bool, len(myArticles))
		for _, a := range myArticles {
			myArticleIDs[a.ID] = true
		}

		tags, err := client.ListFollowedTags()
		if err != nil {
			return fmt.Errorf("fetch followed tags: %w", err)
		}
		if len(tags) == 0 {
			fmt.Println("You don't follow any tags on Dev.to.")
			return nil
		}

		fmt.Printf("Found %d followed tags, looking back %d days (limit: %d likes)\n\n", len(tags), engageDays, engageLimit)

		liked := 0
		seen := make(map[int]bool)

		for _, tag := range tags {
			if liked >= engageLimit {
				break
			}

			articles, err := client.ListArticlesByTag(tag.Name, engageDays)
			if err != nil {
				fmt.Fprintf(os.Stderr, "Warning: failed to fetch articles for tag %q: %v\n", tag.Name, err)
				continue
			}

			for _, article := range articles {
				if liked >= engageLimit {
					break
				}
				// Skip own articles and already-seen articles.
				if myArticleIDs[article.ID] || seen[article.ID] {
					continue
				}
				seen[article.ID] = true

				if dryRun {
					fmt.Printf("[dry-run] Would like: %q by @%s (%s)\n", article.Title, article.User.Username, article.URL)
					liked++
					continue
				}

				result, err := client.ToggleReaction(devto.ReactionToggle{
					Category:      "like",
					ReactableID:   article.ID,
					ReactableType: "Article",
				})
				if err != nil {
					fmt.Fprintf(os.Stderr, "Warning: failed to like article %d: %v\n", article.ID, err)
					continue
				}

				if result.Result == "created" {
					fmt.Printf("Liked: %q by @%s (%s)\n", article.Title, article.User.Username, article.URL)
					liked++
				}
				// If result is "unchanged", the article was already liked — skip silently.
			}
		}

		fmt.Printf("\nDone: %d articles liked\n", liked)
		return nil
	},
}

func init() {
	engageCmd.Flags().IntVar(&engageLimit, "limit", 10, "Maximum number of articles to like")
	engageCmd.Flags().IntVar(&engageDays, "days", 7, "Look back N days for articles")
	rootCmd.AddCommand(engageCmd)
}
