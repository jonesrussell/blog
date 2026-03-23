package hugo

import (
	"fmt"
	"regexp"
	"strings"
)

var (
	// {{< relref "slug" >}} or {{< ref "slug" >}}
	relrefRe = regexp.MustCompile(`\{\{<\s*(?:relref|ref)\s+"([^"]+)"\s*>\}\}`)

	// Opening shortcode: {{< name ... >}}
	openShortcodeRe = regexp.MustCompile(`\{\{<\s*(\w[\w-]*)[^>]*>\}\}`)

	// Closing shortcode: {{< /name >}}
	closeShortcodeRe = regexp.MustCompile(`\{\{<\s*/(\w[\w-]*)\s*>\}\}`)

	// ![alt](path) — we'll filter http(s) manually since RE2 doesn't support lookaheads
	imageRe = regexp.MustCompile(`(!\[[^\]]*\])\(([^)]+)\)`)
)

// TransformForDevto converts Hugo-specific markdown to standard markdown for Dev.to.
// Returns the transformed content and a list of warnings for stripped shortcodes.
// postPath is the relative path from content/posts/ (e.g., "go/my-post") for resolving images.
func TransformForDevto(content, baseURL, postPath string) (string, []string) {
	var warnings []string

	// 1. Transform relref/ref shortcodes to full URLs
	result := relrefRe.ReplaceAllStringFunc(content, func(match string) string {
		submatch := relrefRe.FindStringSubmatch(match)
		slug := submatch[1]
		return fmt.Sprintf("%s/%s/", baseURL, slug)
	})

	// 2. Strip paired unknown shortcodes, keep inner content
	// Go's RE2 doesn't support backreferences, so we do this manually
	result, pairedWarnings := stripPairedShortcodes(result)
	warnings = append(warnings, pairedWarnings...)

	// 3. Strip remaining self-closing unknown shortcodes
	result = openShortcodeRe.ReplaceAllStringFunc(result, func(match string) string {
		warnings = append(warnings, fmt.Sprintf("stripped self-closing shortcode: %s", match))
		return ""
	})

	// 4. Resolve relative image paths to full URLs
	if postPath != "" {
		result = imageRe.ReplaceAllStringFunc(result, func(match string) string {
			submatch := imageRe.FindStringSubmatch(match)
			altPart := submatch[1]
			imgPath := submatch[2]
			// Skip absolute URLs
			if strings.HasPrefix(imgPath, "http://") || strings.HasPrefix(imgPath, "https://") {
				return match
			}
			imgPath = strings.TrimPrefix(imgPath, "./")
			return fmt.Sprintf("%s(%s/%s/%s)", altPart, baseURL, postPath, imgPath)
		})
	}

	return result, warnings
}

// stripPairedShortcodes finds {{< name ... >}}...{{< /name >}} pairs and removes the tags,
// keeping the inner content. Returns the modified string and warnings.
func stripPairedShortcodes(content string) (string, []string) {
	var warnings []string

	for {
		// Find the first closing shortcode
		closeLoc := closeShortcodeRe.FindStringIndex(content)
		if closeLoc == nil {
			break
		}
		closeMatch := closeShortcodeRe.FindStringSubmatch(content[closeLoc[0]:closeLoc[1]])
		name := closeMatch[1]

		// Find the matching opening shortcode before this closing one
		// Build a regex for this specific shortcode name
		openPattern := regexp.MustCompile(`\{\{<\s*` + regexp.QuoteMeta(name) + `[^>]*>\}\}`)
		prefix := content[:closeLoc[0]]
		openLocs := openPattern.FindAllStringIndex(prefix, -1)
		if openLocs == nil {
			// No matching open tag — just strip the close tag
			content = content[:closeLoc[0]] + content[closeLoc[1]:]
			continue
		}

		// Use the last (innermost) opening tag
		openLoc := openLocs[len(openLocs)-1]
		inner := content[openLoc[1]:closeLoc[0]]

		warnings = append(warnings, fmt.Sprintf("stripped paired shortcode: %s", name))
		content = content[:openLoc[0]] + inner + content[closeLoc[1]:]
	}

	return content, warnings
}
