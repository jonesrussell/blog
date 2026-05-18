# admin-spa M4A: workflow admin UI shipped in four PRs

Reference URL: https://github.com/waaseyaa/framework/issues/1414

## Bluesky

Admin SPA M4A shipped in Waaseyaa: workflows list, workflow detail with states+transitions matrix, per-entity transition history, and dry-run state transitions. Four PRs, one full workflow admin surface. #buildinpublic

https://github.com/waaseyaa/framework/issues/1414

## LinkedIn

The Waaseyaa admin SPA now has a complete workflow administration surface. Four PRs landed under M4A.

M4A-1 (#1428): the workflows list page. Every defined workflow in the install, with its bundle association and status, in a list view editors can scan.

M4A-2 (#1430): the workflow detail page. States as a grid, allowed transitions as a matrix, both rendered from the same declarative workflow spec the engine reads. What the engine permits is what the UI displays — no separate documentation to drift.

M4A-3 (#1432): the per-entity transition history widget. On any entity that has a workflow, an editor can see the actual transitions the entity has been through, who triggered each one, when, and from what state to what state. The audit trail that turns "the system" into "people did things, in this order."

M4A-4 (#1434): dry-run state transitions. Before committing a transition, an editor can ask "what happens if I transition this entity from draft to published right now," and the system returns the validation outcome, the side effects that would fire, and any policy violations, without actually making the transition. The undo button for decisions that don't have an undo button.

Together these four PRs are the difference between "workflows exist in code" and "an editor can use workflows confidently." Without the detail view, you don't know what transitions are allowed. Without the history widget, you can't audit what happened. Without dry-run, every transition is a gamble.

Same M4 mission tracker, four sequential work packages, all merged in one week. A clean example of what shipping a UI surface in slices looks like when the architecture is right.

https://github.com/waaseyaa/framework/issues/1414

## Facebook

The Waaseyaa admin SPA has a complete workflow administration surface after four PRs landed under M4A.

M4A-1: workflows list page. M4A-2: workflow detail with states grid and transitions matrix. M4A-3: per-entity transition history widget showing who did what and when. M4A-4: dry-run state transitions so editors can preview a transition's outcome before committing it.

Together they turn "workflows exist in code" into "an editor can use workflows confidently." Four sequential work packages, one week, one coherent UI surface.

https://github.com/waaseyaa/framework/issues/1414

#buildinpublic #waaseyaa
