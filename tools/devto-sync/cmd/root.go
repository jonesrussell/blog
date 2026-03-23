package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	dryRun     bool
	contentDir string
	baseURL    string
)

var rootCmd = &cobra.Command{
	Use:   "devto-sync",
	Short: "Bidirectional sync between Hugo blog and Dev.to",
	Long:  "Syncs blog posts between a Hugo blog (canonical) and Dev.to. Blog always wins.",
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().BoolVar(&dryRun, "dry-run", false, "Log what would happen without making changes")
	rootCmd.PersistentFlags().StringVar(&contentDir, "content-dir", "content/posts", "Path to Hugo content directory")
	rootCmd.PersistentFlags().StringVar(&baseURL, "base-url", "https://jonesrussell.github.io/blog", "Blog base URL for canonical links")
}
