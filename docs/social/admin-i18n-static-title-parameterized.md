# Admin SPA: parameterized static title + 11 i18n keys

Reference URL: https://github.com/waaseyaa/framework/commit/5da7e0c

## Bluesky

The admin SPA title is no longer hardcoded English. Parameterized through i18n along with 11 new nav-group keys. Every label on the admin chrome is now translatable. Small fix, real reach. #buildinpublic

https://github.com/waaseyaa/framework/commit/5da7e0c

## LinkedIn

The Waaseyaa admin SPA now reads every chrome label through the i18n layer.

Specifically: the static `<title>` element that was hardcoded to English is now parameterized, and eleven nav-group labels picked up i18n keys in the same pass. Eleven is not a big number. The point is that none of them are hardcoded anymore.

I keep coming back to this kind of detail because it tells you something about the build. Admin UIs ship in English first because the team builds in English, the demo is in English, and the docs are in English. The labels just kind of sit there. Six months later somebody asks "can a French speaker use this?" and the answer involves opening every Vue component to find the strings.

Doing it now, on a young codebase, is a multi-hour fix. Doing it later, when there are forty more components, is a project. The cheap fix today is the expensive fix in November.

Worth a flag because i18n hygiene is the kind of work that doesn't show up in feature lists, but does show up in adoption when somebody installs the framework in a non-English locale and notices nothing is broken.

https://github.com/waaseyaa/framework/commit/5da7e0c

## Facebook

The Waaseyaa admin SPA now reads every label on its chrome through the i18n layer. The static page title was hardcoded English; eleven nav-group labels lacked translation keys. Both got fixed in one pass.

Eleven labels is a small change. The point is none of them are hardcoded anymore. Admin UIs always ship in English first, and the cleanup gets harder the longer you wait. Cheap fix today, project fix in six months.

https://github.com/waaseyaa/framework/commit/5da7e0c

#buildinpublic #waaseyaa
