package hugo_test

import (
	"testing"

	"github.com/jonesrussell/blog/tools/devto-sync/internal/hugo"
)

func TestTransformRelref(t *testing.T) {
	input := `Check out {{< relref "my-other-post" >}} for details.`
	expected := `Check out https://jonesrussell.github.io/blog/my-other-post/ for details.`

	result, warnings := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
	if len(warnings) != 0 {
		t.Errorf("unexpected warnings: %v", warnings)
	}
}

func TestTransformRef(t *testing.T) {
	input := `See {{< ref "another-post" >}} here.`
	expected := `See https://jonesrussell.github.io/blog/another-post/ here.`

	result, _ := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
}

func TestTransformUnknownShortcode(t *testing.T) {
	input := `Before {{< custom-thing arg="val" >}}inner content{{< /custom-thing >}} after.`
	expected := `Before inner content after.`

	result, warnings := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
	if len(warnings) != 1 {
		t.Fatalf("expected 1 warning, got %d", len(warnings))
	}
}

func TestTransformRelativeImages(t *testing.T) {
	input := `![Screenshot](screenshot.png)`
	expected := `![Screenshot](https://jonesrussell.github.io/blog/go/my-post/screenshot.png)`

	result, _ := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "go/my-post")
	if result != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, result)
	}
}

func TestTransformAbsoluteImagesUntouched(t *testing.T) {
	input := `![Logo](https://example.com/logo.png)`
	result, _ := hugo.TransformForDevto(input, "https://jonesrussell.github.io/blog", "go/my-post")
	if result != input {
		t.Errorf("absolute image URL should be untouched, got:\n%s", result)
	}
}
