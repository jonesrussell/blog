# PHP 8.5 restraint: features we did not adopt

Reference URL: https://jonesrussell.github.io/blog/php-restraint-over-adoption/

## X

An upgrade is a decision about what to add and what not to add. Both decisions live in the diff. We rejected 5 of 7 array_find candidates. Wrote up why. #buildinpublic

https://jonesrussell.github.io/blog/php-restraint-over-adoption/

## LinkedIn

Most PHP upgrade writeups read like a feature tour. Here is what is new, here is how to use it. They are useful and they are not the whole story.

The other half of an upgrade is what you choose not to add. That choice is invisible in the diff and load-bearing in the codebase.

Waaseyaa shipped 8.5 without property hooks. Without the pipe operator. With array_find() adopted at only 2 of 7 candidate sites. None of that is rejection of the features. It is restraint about the window in which to adopt them.

The five array_find rejections are the most interesting case. The pattern is foreach-and-return-first, exactly what array_find was designed for. Why reject five out of seven?

Because the surrounding contracts mattered more than the function. Each rejected caller had a type guarantee that the search would not return null. The foreach version was doing two things: searching and asserting. Replacing it with array_find keeps the search and loses the assertion. You write an explicit guard right after the call. Line count is the same. Intent is worse.

The fastest way to spot this in your own codebase: read the immediate caller. If it throws or asserts on the result, do not adopt array_find there. The foreach is encoding more than iteration.

If your team is doing a PHP 8.5 upgrade, the most useful thing you can write down is not the list of features you adopted. It is the list of features you considered and rejected, with one sentence each. That list is what makes the upgrade a position, not a checklist.

Post three of three in the upgrade series.

https://jonesrussell.github.io/blog/php-restraint-over-adoption/

## Facebook

Shipped Waaseyaa on PHP 8.5 without adopting property hooks, the pipe operator, or broad array_find. The mission considered 7 array_find sites and rejected 5. Wrote up the reasoning.

The argument: an upgrade is also a decision about what not to add. That decision is invisible in the diff and load-bearing in the codebase. Worth writing down somewhere.

Post three of three on the upgrade.

https://jonesrussell.github.io/blog/php-restraint-over-adoption/

#buildinpublic
