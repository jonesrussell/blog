package cmd

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
	"github.com/spf13/cobra"
)

var triageCmd = &cobra.Command{
	Use:   "triage",
	Short: "Propose archive/update/replace actions for imported posts",
	Long:  "Analyzes imported Dev.to posts by age, topic, and content quality. Output is advisory only.",
	RunE: func(cmd *cobra.Command, args []string) error {
		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		// Filter to only posts with devto_id (imported or matched)
		var imported []*hugo.Post
		for _, p := range posts {
			if p.DevtoID > 0 {
				imported = append(imported, p)
			}
		}

		results := devsync.Triage(imported)

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "SLUG\tPUBLISHED\tACTION\tREASON")
		fmt.Fprintln(w, "----\t---------\t------\t------")

		var keep, update, replace int
		for _, r := range results {
			fmt.Fprintf(w, "%s\t%s\t%s\t%s\n", r.Slug, r.Published, r.Action, r.Reason)
			switch r.Action {
			case "keep":
				keep++
			case "update":
				update++
			case "replace":
				replace++
			}
		}
		w.Flush()

		fmt.Printf("\nSummary: %d keep, %d update, %d replace/archive\n", keep, update, replace)
		fmt.Println("This output is advisory. Review and act manually.")
		return nil
	},
}

func init() {
	rootCmd.AddCommand(triageCmd)
}
