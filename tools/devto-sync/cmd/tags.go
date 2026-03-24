package cmd

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	"github.com/spf13/cobra"
)

var tagsCmd = &cobra.Command{
	Use:   "tags",
	Short: "Check post tags against the Dev.to tag registry",
	Long:  "Fetches the top 500 tags from Dev.to and checks each syncable post's tags against them.",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)

		// Fetch top 500 tags (5 pages x 100)
		known := make(map[string]bool)
		for page := 1; page <= 5; page++ {
			tags, err := client.ListTags(page, 100)
			if err != nil {
				return fmt.Errorf("fetch tags page %d: %w", page, err)
			}
			for _, t := range tags {
				known[strings.ToLower(t.Name)] = true
			}
			if len(tags) < 100 {
				break
			}
		}
		fmt.Fprintf(os.Stderr, "Loaded %d known Dev.to tags\n", len(known))

		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "POST\tTAG\tSTATUS")
		fmt.Fprintln(w, "----\t---\t------")

		issues := 0
		for _, p := range posts {
			if !p.ShouldSync() {
				continue
			}
			for _, tag := range p.Tags {
				sanitized := strings.ToLower(strings.ReplaceAll(tag, "-", ""))
				if !known[sanitized] {
					fmt.Fprintf(w, "%s\t%s\tNOT FOUND on Dev.to\n", truncateStr(p.Slug, 40), tag)
					issues++
				}
			}
		}
		w.Flush()

		if issues == 0 {
			fmt.Println("All tags recognized on Dev.to.")
		} else {
			fmt.Printf("\n%d tag(s) not found in Dev.to's top 500 tags.\n", issues)
		}
		return nil
	},
}

func truncateStr(s string, max int) string {
	if max < 4 {
		max = 4
	}
	if len(s) <= max {
		return s
	}
	return s[:max-3] + "..."
}

func init() {
	rootCmd.AddCommand(tagsCmd)
}
