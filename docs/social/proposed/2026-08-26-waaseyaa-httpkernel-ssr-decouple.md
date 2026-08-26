Queue-Issue: #126
Reference URL: https://github.com/waaseyaa/framework/pull/1129

## Bluesky

waaseyaa/foundation was instantiating Waaseyaa\SSR\RenderCache in HttpKernel without declaring the dependency. Layer 0 importing layer 6. Fixed in three commits: wrong attempt, revert, then interfaces and a LayerDependencyTest. https://github.com/waaseyaa/framework/pull/1129 #buildinpublic

## LinkedIn

If your foundation package directly instantiates classes from a package six layers above it, you have a layering violation that composer will eventually expose.

That is what happened in Waaseyaa.

waaseyaa/foundation's HttpKernel was directly instantiating Waaseyaa\SSR\RenderCache and SsrPageHandler at boot. The foundation package never declared waaseyaa/ssr as a dependency. As long as ssr came in transitively, everything worked. The moment someone ran composer update and ssr dropped out of the dependency tree, every request crashed with "Class Waaseyaa\SSR\RenderCache not found".

The first fix looked obvious: add waaseyaa/ssr to foundation's require list. Commit 5001c5d did exactly that.

The problem with that fix is that it made the violation permanent. You do not fix a layer violation by formalizing it. Foundation is layer 0. SSR is layer 6. Declaring a hard dependency from layer 0 to layer 6 means the entire foundation package now depends on your rendering layer. That is worse than a transitive accident.

So the first fix got reverted the same day.

The real fix took a different approach. Three interfaces moved into foundation: InertiaFullPageRendererInterface, InertiaPageResultInterface, and LanguagePathStripperInterface. HttpKernel now depends on those contracts, not on concrete SSR classes. SsrServiceProvider registers its HTTP routers from the SSR package itself, not from inside the kernel.

The fix also added LayerDependencyTest.php to enforce the boundary going forward. If someone adds an import that crosses the layer boundary, the test fails before it reaches main.

39 files changed, 652 insertions, 228 deletions.

https://github.com/waaseyaa/framework/pull/1129

#buildinpublic #php #waaseyaa #symfony #refactoring

## Facebook

Your PHP framework's kernel should not know your SSR renderer exists.

In Waaseyaa, foundation's HttpKernel was directly instantiating Waaseyaa\SSR\RenderCache and SsrPageHandler, without declaring waaseyaa/ssr as a dependency. Layer 0 importing layer 6. Once ssr fell out of the transitive dependency tree, every request crashed.

The first fix tried to declare ssr as a hard dependency. It got reverted the same day. Formalizing a layer violation does not fix it. The real fix extracted three interfaces into foundation, moved HTTP router registration into SsrServiceProvider, and added LayerDependencyTest.php to keep the boundary enforced.

https://github.com/waaseyaa/framework/pull/1129 #buildinpublic #php
