# admin-spa modernization audit: top 5 follow-up missions

Reference URL: https://github.com/waaseyaa/framework/issues/1416

## Bluesky

Audited the Waaseyaa admin SPA and ranked the top 5 modernization missions. The audit is the cheapest pass to run before you commit to weeks of UI work. M1B, M3, M4 are now sequenced and being worked. #buildinpublic

https://github.com/waaseyaa/framework/issues/1416

## LinkedIn

Ran a modernization audit on the Waaseyaa admin SPA and ranked the top 5 follow-up missions. Worth talking about because audits get under-used.

The shape of the work: pull every issue tagged admin-spa, every TODO comment in the code, every "we should clean this up" note from PRs, every Lighthouse warning that's been sitting in the report for a month. Group by surface. Rank by impact-times-likelihood-of-doing-it.

What came out: five missions, sequenced. M1B-icon (swap the AdminShell hamburger to @nuxt/icon, already shipped). M3 (bundle filter and bundle picker, shipped last week). M4A (workflow admin UI, shipped this week as a 4-PR bundle). M4B and M5 are queued, with scope defined.

The audit didn't invent any of this work. It surfaced what was already implicit in scattered issues and notes, and gave it an order. The first three missions were already in flight; the audit confirmed they were the right next steps and clarified what came after.

Two reasons audits beat just-keep-going:

You see the whole surface at once. Walking issue-by-issue, you lose sight of which 5 missions together change the most. The audit puts them on one page so you can rank.

You stop carrying scattered context in your head. After the audit, the next two months of admin work are recorded as missions with scope and acceptance criteria. The mental load drops.

If your project has accumulated a backlog of "we should..." notes that aren't acting on each other, pause for an audit. It's the cheapest pass available and it bounds the next chunk of work.

https://github.com/waaseyaa/framework/issues/1416

## Facebook

Ran a modernization audit on the Waaseyaa admin SPA and ranked the top 5 follow-up missions.

Audits don't invent work, they surface and sequence work already implicit in scattered issues and TODOs. After this one: M1B icon swap (shipped), M3 bundle filter+picker (shipped), M4A workflow admin UI (shipped), with M4B and M5 queued.

If your project has accumulated "we should..." notes that aren't acting on each other, pause for an audit. Cheapest pass available, biggest reduction in cognitive load.

https://github.com/waaseyaa/framework/issues/1416

#buildinpublic #waaseyaa
