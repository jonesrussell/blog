package cmd

import (
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show sync state across all posts",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)
		engine := devsync.NewEngine(client, baseURL)

		posts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}

		results, err := engine.Status(posts)
		if err != nil {
			return err
		}

		w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
		fmt.Fprintln(w, "SLUG\tDEVTO_ID\tSTATUS\tCANONICAL\tNOTES")
		fmt.Fprintln(w, "----\t--------\t------\t---------\t-----")

		var synced, unsynced, missing int
		for _, r := range results {
			status := "unsynced"
			canonical := "-"
			notes := ""

			switch {
			case !r.HasDevtoID:
				status = "no devto_id"
				missing++
			case !r.OnDevto:
				status = "NOT FOUND"
				notes = r.Drift
				unsynced++
			case r.Synced && r.CanonicalOK:
				status = "synced"
				canonical = "ok"
				synced++
			default:
				status = "drift"
				if !r.CanonicalOK {
					canonical = "MISSING"
				}
				notes = r.Drift
				unsynced++
			}

			fmt.Fprintf(w, "%s\t%d\t%s\t%s\t%s\n", r.Slug, r.DevtoID, status, canonical, notes)
		}
		w.Flush()

		fmt.Printf("\nSummary: %d synced, %d drifted, %d missing devto_id\n", synced, unsynced, missing)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(statusCmd)
}
