## Bluesky

Waaseyaa's shared admin shell was missing a skip link and had unhidden decorative icons. Fixed both, plus a focus trick so the skip link's target is only focusable for the moment it is used. https://jonesrussell.github.io/blog/operator-shell-skip-link-accessibility/ #buildinpublic #a11y

## LinkedIn

The admin shell every Waaseyaa hosting instance reuses was missing two baseline accessibility requirements: a skip link as the first focusable element, and aria-hidden on its decorative icons.

The interesting part is the skip link's target. Main is not focusable by default, so jumping to it needs tabindex -1. But leaving that attribute on permanently means any ordinary mouse click inside main focuses it too, and changes tab order for everything after. The fix adds the attribute right before the browser's own anchor jump runs, then removes it on blur, so main is focusable only for the moment the skip is used.

A regression test locks in that main never carries tabindex in the rendered markup. Another computes WCAG contrast ratios on the skip link itself, checked against the default sidebar, a themed instance sidebar, and a light-mode sidebar, since the link is only visible while focused and has to stay legible against whatever chrome a host applies.

https://jonesrussell.github.io/blog/operator-shell-skip-link-accessibility/

#buildinpublic #waaseyaa #php #a11y #webdev

## Facebook

Fixed two accessibility gaps in Waaseyaa's shared admin shell: a missing skip link and decorative icons that were not hidden from screen readers. The skip link needed a small focus trick so its target is only focusable for the moment it is actually used, instead of changing tab order on every click.

https://jonesrussell.github.io/blog/operator-shell-skip-link-accessibility/

#buildinpublic #a11y
