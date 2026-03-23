package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	devsync "github.com/jonesrussell/blog/tools/devto-sync/internal/sync"
	"github.com/spf13/cobra"
)

var pushAll bool
var pushSlug string

var pushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push blog posts to Dev.to",
	Long:  "Push one or all blog posts to Dev.to. Creates new articles or updates existing ones.",
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

		var targets []*hugo.Post
		if pushSlug != "" {
			for _, p := range posts {
				if p.Slug == pushSlug {
					targets = append(targets, p)
					break
				}
			}
			if len(targets) == 0 {
				return fmt.Errorf("post with slug %q not found", pushSlug)
			}
		} else if pushAll {
			for _, p := range posts {
				if p.ShouldSync() {
					targets = append(targets, p)
				}
			}
		} else {
			return fmt.Errorf("specify --all or --slug <slug>")
		}

		var failed int
		var created []string
		for _, post := range targets {
			result, err := engine.PushPost(post, dryRun)
			if err != nil {
				log.Printf("ERROR [%s]: %v", post.Slug, err)
				failed++
				if pushSlug != "" {
					return err
				}
				continue
			}

			// Write back devto_id for new posts
			if result != nil && post.DevtoID == 0 && !dryRun {
				if err := hugo.WriteDevtoID(post.FilePath, result.ID); err != nil {
					log.Printf("WARNING: failed to write devto_id for %s: %v", post.Slug, err)
				}
				created = append(created, fmt.Sprintf("%s (id=%d)", post.Slug, result.ID))
			}
		}

		fmt.Printf("\nPush complete: %d posts processed", len(targets))
		if failed > 0 {
			fmt.Printf(", %d failed", failed)
		}
		if len(created) > 0 {
			fmt.Printf("\nNew articles created (devto_id written to frontmatter):\n")
			for _, c := range created {
				fmt.Printf("  - %s\n", c)
			}
		}
		fmt.Println()

		if failed > 0 {
			os.Exit(1)
		}
		return nil
	},
}

func init() {
	pushCmd.Flags().BoolVar(&pushAll, "all", false, "Push all eligible posts")
	pushCmd.Flags().StringVar(&pushSlug, "slug", "", "Push a specific post by slug")
	rootCmd.AddCommand(pushCmd)
}
