package cmd

import (
	"fmt"
	"os"
	"sort"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/spf13/cobra"
)

var (
	analyticsSort  string
	analyticsLimit int
)

var analyticsCmd = &cobra.Command{
	Use:   "analytics",
	Short: "Show article performance stats (views, reactions, comments)",
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

		// Filter to published only
		published := make([]devto.Article, 0, len(articles))
		for _, a := range articles {
			if a.Published {
				published = append(published, a)
			}
		}

		// Sort descending by chosen field
		sort.Slice(published, func(i, j int) bool {
			switch analyticsSort {
			case "reactions":
				return published[i].PositiveReactionsCount > published[j].PositiveReactionsCount
			case "comments":
				return published[i].CommentsCount > published[j].CommentsCount
			default: // views
				return published[i].PageViewsCount > published[j].PageViewsCount
			}
		})

		// Apply limit
		if analyticsLimit > 0 && analyticsLimit < len(published) {
			published = published[:analyticsLimit]
		}

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "VIEWS\tREACTIONS\tCOMMENTS\tRATIO\tTITLE")
		fmt.Fprintln(w, "-----\t---------\t--------\t-----\t-----")

		var totalViews, totalReactions, totalComments int
		for _, a := range published {
			ratio := ""
			if a.PageViewsCount > 0 {
				ratio = fmt.Sprintf("%.1f%%", float64(a.PositiveReactionsCount)/float64(a.PageViewsCount)*100)
			}
			fmt.Fprintf(w, "%d\t%d\t%d\t%s\t%s\n",
				a.PageViewsCount,
				a.PositiveReactionsCount,
				a.CommentsCount,
				ratio,
				truncate(a.Title, 60),
			)
			totalViews += a.PageViewsCount
			totalReactions += a.PositiveReactionsCount
			totalComments += a.CommentsCount
		}
		w.Flush()

		totalRatio := ""
		if totalViews > 0 {
			totalRatio = fmt.Sprintf("%.1f%%", float64(totalReactions)/float64(totalViews)*100)
		}
		fmt.Printf("\nTotals: %d views, %d reactions, %d comments (%s ratio)\n",
			totalViews, totalReactions, totalComments, totalRatio)
		fmt.Printf("Articles: %d published\n", len(published))

		return nil
	},
}

func truncate(s string, max int) string {
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	return string(runes[:max-3]) + "..."
}

func init() {
	analyticsCmd.Flags().StringVar(&analyticsSort, "sort", "views", "Sort by: views, reactions, comments")
	analyticsCmd.Flags().IntVar(&analyticsLimit, "limit", 0, "Show top N articles (0=all)")
	rootCmd.AddCommand(analyticsCmd)
}
