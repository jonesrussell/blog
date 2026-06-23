# Reactions and comments need their parent's access, not their own

Reference URL: https://github.com/waaseyaa/framework/pull/1726

## Bluesky

Access-control bug: our engagement policy allowed view unconditionally, so reactions and comments on an unpublished post were publicly visible, even unmoderated ones. Fix: cascade visibility from the parent. https://github.com/waaseyaa/framework/pull/1726 #buildinpublic

## LinkedIn

A child resource is only as private as its parent. We just had to enforce that the hard way.

Our engagement layer handles reactions, comments, and follows. The access policy for viewing them returned allowed for the view action unconditionally. It looked fine in isolation: who cares if someone reads a reaction.

The problem is what a reaction is attached to. Reactions and comments on a draft or unpublished post were publicly viewable, even though the post itself was not. So the private content leaked through its own engagement: you could read the comments on something you were never allowed to see. On top of that, an unmoderated comment, one explicitly held back with a false status, was also publicly visible.

The fix makes view cascade from the parent. The policy now loads the target and grants visibility based on whether the caller can see that parent, and it honors comment moderation status instead of ignoring it.

The general lesson: authorization has to follow the relationship. A comment, a reaction, a like, an attachment, a revision, these are all derived from a parent, and they inherit the parent's visibility. If you authorize the child in isolation, you have built a side channel around the parent's access control.

https://github.com/waaseyaa/framework/pull/1726

#buildinpublic #security #php #softwarearchitecture

## Facebook

A reminder that a child resource is only as private as its parent. Our engagement layer handles reactions, comments, and follows, and its view policy allowed viewing unconditionally. That meant reactions and comments on a draft or unpublished post were publicly visible, even though the post was not, so private content leaked through its own comment thread. Unmoderated comments showed too.

The fix makes visibility cascade from the parent: you can only see the engagement if you can see the thing it is attached to, and held-back comments stay held back. The general lesson: authorization has to follow the relationship. Comments, reactions, attachments, and revisions all inherit their parent's access. Authorize the child in isolation and you have built a side channel around the parent. https://github.com/waaseyaa/framework/pull/1726

#buildinpublic
