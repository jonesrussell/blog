# Symfony ^7.3 floor constraints audit

## Facebook

Audited Symfony version floors across the Waaseyaa framework monorepo. Found 6 packages pinned to ^7.3. Checked each one against its actual Symfony API usage. None of them called anything that requires 7.3. All 6 relaxed to ^7.0.

The policy going forward: every floor constraint needs a named API reason to exist, or it gets relaxed. Undocumented floors are a silent compatibility tax on every downstream consumer.

https://github.com/waaseyaa/framework/issues/1151

#php #symfony #opensource

## X

Audited 6 Symfony ^7.3 floors in our monorepo. None were justified by actual API usage. All 6 relaxed to ^7.0. Policy: every floor needs a named reason or it goes. https://github.com/waaseyaa/framework/issues/1151 #buildinpublic

## LinkedIn

Audited Symfony version floor constraints across the Waaseyaa framework monorepo. Six packages were pinned to ^7.3. After checking each against actual API usage, none of them required anything introduced after 7.0. All six were relaxed.

The new policy: every ^7.x floor constraint must be documented with the specific API or behavior that requires it. If you can't name the reason, you relax it. Undocumented floors silently restrict downstream consumers.

https://github.com/waaseyaa/framework/issues/1151
