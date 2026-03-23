package cmd

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var (
	pullAll         bool
	pullID          int
	pullForce       bool
	pullCategory    string
	pullCategoryMap string
)

var pullCmd = &cobra.Command{
	Use:   "pull",
	Short: "Import Dev.to articles into the blog",
	Long:  "Import one or all unmatched Dev.to articles as Hugo page bundles with draft: true.",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)

		// Load existing posts to find which devto_ids we already have
		existingPosts, err := hugo.ListPosts(contentDir)
		if err != nil {
			return fmt.Errorf("list posts: %w", err)
		}
		existingIDs := make(map[int]bool)
		for _, p := range existingPosts {
			if p.DevtoID > 0 {
				existingIDs[p.DevtoID] = true
			}
		}

		// Load category map if provided
		catMap := make(map[int]string)
		if pullCategoryMap != "" {
			f, err := os.Open(pullCategoryMap)
			if err != nil {
				return fmt.Errorf("open category map: %w", err)
			}
			defer f.Close()
			reader := csv.NewReader(f)
			records, err := reader.ReadAll()
			if err != nil {
				return fmt.Errorf("read category map: %w", err)
			}
			for _, rec := range records {
				if len(rec) >= 2 {
					id, _ := strconv.Atoi(rec[0])
					catMap[id] = rec[1]
				}
			}
		}

		if pullID > 0 {
			return pullSingle(client, pullID, existingIDs, catMap)
		}

		if pullAll {
			return pullAllArticles(client, existingIDs, catMap)
		}

		return fmt.Errorf("specify --all or --id <id>")
	},
}

func pullSingle(client *devto.Client, id int, existingIDs map[int]bool, catMap map[int]string) error {
	if existingIDs[id] && !pullForce {
		return fmt.Errorf("article %d already exists in blog (use --force to re-import)", id)
	}

	article, err := client.GetArticle(id)
	if err != nil {
		return fmt.Errorf("get article %d: %w", id, err)
	}

	category := pullCategory
	if c, ok := catMap[id]; ok {
		category = c
	}
	if category == "" {
		return fmt.Errorf("--category required for pull --id")
	}

	return importArticle(article, category)
}

func pullAllArticles(client *devto.Client, existingIDs map[int]bool, catMap map[int]string) error {
	// Check for non-interactive mode
	isTTY := term.IsTerminal(int(os.Stdin.Fd()))
	if !isTTY && len(catMap) == 0 {
		return fmt.Errorf("--category-map required in non-interactive mode")
	}

	articles, err := client.ListMyArticles()
	if err != nil {
		return fmt.Errorf("list articles: %w", err)
	}

	var imported, skipped, failed int
	for _, article := range articles {
		if !article.Published {
			continue
		}
		if existingIDs[article.ID] {
			skipped++
			continue
		}

		category := catMap[article.ID]
		if category == "" && isTTY {
			fmt.Printf("\nArticle: %s (id=%d)\n", article.Title, article.ID)
			fmt.Print("Category [ai/cursor/devops/docker/general/go/laravel/psr]: ")
			fmt.Scanln(&category)
		}
		if category == "" {
			category = "general"
		}

		if dryRun {
			log.Printf("[DRY RUN] Would import: %s → %s/%s", article.Title, category, article.Slug)
			imported++
			continue
		}

		if err := importArticle(&article, category); err != nil {
			log.Printf("ERROR [%d]: %v", article.ID, err)
			failed++
			continue
		}
		imported++
	}

	fmt.Printf("\nPull complete: %d imported, %d skipped (already exist)", imported, skipped)
	if failed > 0 {
		fmt.Printf(", %d failed", failed)
	}
	fmt.Println()

	if failed > 0 {
		os.Exit(1)
	}
	return nil
}

func importArticle(article *devto.Article, category string) error {
	var series []interface{}
	if article.Series != nil && *article.Series != "" {
		series = []interface{}{*article.Series}
	}

	fm := map[string]interface{}{
		"title":    article.Title,
		"date":     article.PublishedAt,
		"slug":     article.Slug,
		"summary":  article.Description,
		"draft":    true,
		"devto":    true,
		"devto_id": article.ID,
	}
	if len(series) > 0 {
		fm["series"] = series
	}

	// Parse tags from comma-separated string
	if article.Tags != "" {
		tags := []interface{}{}
		for _, t := range splitTags(article.Tags) {
			tags = append(tags, t)
		}
		fm["tags"] = tags
	}
	fm["categories"] = []interface{}{}

	path, err := hugo.CreatePageBundle(contentDir, category, article.Slug, fm, article.BodyMarkdown)
	if err != nil {
		return err
	}
	log.Printf("Imported: %s → %s", article.Title, path)
	return nil
}

// splitTags parses a Dev.to tag_list string (comma and/or space separated) into individual tags.
func splitTags(s string) []string {
	// Dev.to tag_list can be "go, testing" or "go testing" — normalize both
	s = strings.ReplaceAll(s, ",", " ")
	var tags []string
	for _, t := range strings.Fields(s) {
		tags = append(tags, t)
	}
	return tags
}

func init() {
	pullCmd.Flags().BoolVar(&pullAll, "all", false, "Pull all unmatched articles")
	pullCmd.Flags().IntVar(&pullID, "id", 0, "Pull a specific article by ID")
	pullCmd.Flags().BoolVar(&pullForce, "force", false, "Force re-import even if already matched")
	pullCmd.Flags().StringVar(&pullCategory, "category", "", "Category for the imported post")
	pullCmd.Flags().StringVar(&pullCategoryMap, "category-map", "", "CSV file mapping Dev.to IDs to categories")
	rootCmd.AddCommand(pullCmd)
}
