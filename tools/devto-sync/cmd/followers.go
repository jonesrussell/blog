package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/devto"
	"github.com/spf13/cobra"
)

const (
	followersPerPage = 1000
	maxSnapshots     = 52
)

type followerSnapshot struct {
	Count     int      `json:"count"`
	Timestamp string   `json:"timestamp"`
	Usernames []string `json:"usernames,omitempty"`
}

type followerHistory struct {
	Snapshots []followerSnapshot `json:"snapshots"`
}

var followersCmd = &cobra.Command{
	Use:   "followers",
	Short: "Track follower count and growth over time",
	RunE: func(cmd *cobra.Command, args []string) error {
		apiKey := os.Getenv("DEVTO_API_KEY")
		if apiKey == "" {
			return fmt.Errorf("DEVTO_API_KEY environment variable is required")
		}

		client := devto.NewClient(apiKey)

		var allFollowers []devto.Follower
		page := 1
		for {
			followers, err := client.ListFollowers(page, followersPerPage)
			if err != nil {
				return fmt.Errorf("fetch followers: %w", err)
			}
			if len(followers) == 0 {
				break
			}
			allFollowers = append(allFollowers, followers...)
			if len(followers) < followersPerPage {
				break
			}
			page++
		}

		currentCount := len(allFollowers)
		currentUsernames := make([]string, len(allFollowers))
		for i, f := range allFollowers {
			currentUsernames[i] = f.Username
		}

		dataDir := filepath.Join("tools", "devto-sync", "data")
		historyPath := filepath.Join(dataDir, "followers.json")

		history := followerHistory{}
		if data, err := os.ReadFile(historyPath); err == nil {
			if err := json.Unmarshal(data, &history); err != nil {
				return fmt.Errorf("decode history: %w", err)
			}
		}

		fmt.Printf("Current followers: %d\n", currentCount)

		if len(history.Snapshots) > 0 {
			last := history.Snapshots[len(history.Snapshots)-1]
			diff := currentCount - last.Count
			switch {
			case diff > 0:
				fmt.Printf("Change: +%d since %s\n", diff, last.Timestamp)
			case diff < 0:
				fmt.Printf("Change: %d since %s\n", diff, last.Timestamp)
			default:
				fmt.Printf("Change: no change since %s\n", last.Timestamp)
			}

			if diff > 0 && diff <= 20 {
				lastSet := make(map[string]bool, len(last.Usernames))
				for _, u := range last.Usernames {
					lastSet[u] = true
				}
				fmt.Println("New followers:")
				for _, u := range currentUsernames {
					if !lastSet[u] {
						fmt.Printf("  - @%s\n", u)
					}
				}
			}
		}

		snapshot := followerSnapshot{
			Count:     currentCount,
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Usernames: currentUsernames,
		}
		history.Snapshots = append(history.Snapshots, snapshot)

		if len(history.Snapshots) > maxSnapshots {
			history.Snapshots = history.Snapshots[len(history.Snapshots)-maxSnapshots:]
		}

		if err := os.MkdirAll(dataDir, 0o755); err != nil {
			return fmt.Errorf("create data dir: %w", err)
		}

		data, err := json.MarshalIndent(history, "", "  ")
		if err != nil {
			return fmt.Errorf("encode history: %w", err)
		}
		if err := os.WriteFile(historyPath, data, 0o644); err != nil {
			return fmt.Errorf("write history: %w", err)
		}

		fmt.Printf("Snapshot saved to %s\n", historyPath)
		return nil
	},
}

func init() {
	rootCmd.AddCommand(followersCmd)
}
