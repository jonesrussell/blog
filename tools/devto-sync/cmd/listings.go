package cmd

import (
	"fmt"
	"os"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/spf13/cobra"
)

var (
	listingTitle    string
	listingBody     string
	listingCategory string
	listingTags     []string
)

var validCategories = map[string]bool{
	"cfp":       true,
	"forhire":   true,
	"collabs":   true,
	"education": true,
	"jobs":      true,
	"mentors":   true,
	"mentees":   true,
	"forsale":   true,
	"events":    true,
	"misc":      true,
}

var listingsCmd = &cobra.Command{
	Use:   "listings",
	Short: "Create a Dev.to listing",
	Long:  "Create a classified listing on Dev.to (cfp, forhire, collabs, education, jobs, mentors, mentees, forsale, events, misc).",
	RunE: func(cmd *cobra.Command, args []string) error {
		if listingTitle == "" {
			return fmt.Errorf("--title is required")
		}
		if listingBody == "" {
			return fmt.Errorf("--body is required")
		}
		if listingCategory == "" {
			return fmt.Errorf("--category is required")
		}
		if !validCategories[listingCategory] {
			return fmt.Errorf("invalid category %q; valid: cfp, forhire, collabs, education, jobs, mentors, mentees, forsale, events, misc", listingCategory)
		}

		req := devto.ListingCreate{
			Listing: devto.ListingBody{
				Title:             listingTitle,
				BodyMarkdown:      listingBody,
				Category:          listingCategory,
				Tags:              listingTags,
				ContactViaConnect: true,
			},
		}

		if dryRun {
			fmt.Printf("[dry-run] Would create listing: title=%q category=%s\n", listingTitle, listingCategory)
			return nil
		}

		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)
		listing, err := client.CreateListing(req)
		if err != nil {
			return fmt.Errorf("create listing: %w", err)
		}

		fmt.Printf("Created listing %d (category: %s)\n", listing.ID, listing.Category)
		return nil
	},
}

func init() {
	listingsCmd.Flags().StringVar(&listingTitle, "title", "", "Listing title (required)")
	listingsCmd.Flags().StringVar(&listingBody, "body", "", "Listing body in markdown (required)")
	listingsCmd.Flags().StringVar(&listingCategory, "category", "", "Listing category (required): cfp, forhire, collabs, education, jobs, mentors, mentees, forsale, events, misc")
	listingsCmd.Flags().StringSliceVar(&listingTags, "tags", nil, "Comma-separated tags")
	rootCmd.AddCommand(listingsCmd)
}
