# Giiken CLI: Symfony-free on the Waaseyaa CliKernel

Reference URL: https://github.com/waaseyaa/giiken/commit/b41be09

## Bluesky

Giiken's CLI ingestion path is now Symfony-free. Rebuilt on the Waaseyaa-native CliKernel. Faster boot, one less heavyweight dep, the same downstream lesson the framework taught itself months ago. #buildinpublic

https://github.com/waaseyaa/giiken/commit/b41be09

## LinkedIn

Giiken, the Waaseyaa-based application I've been building alongside the framework, just ripped Symfony out of its CLI ingestion path. The new `giiken:ingest:file` command runs on the Waaseyaa-native CliKernel — same kernel the framework itself uses now that mission #1107 decoupled the api package from Symfony.

What this is, concretely: the previous Giiken CLI was Symfony-flavored. Boot a Symfony Application, register a Symfony Command, pick up the framework via service-container lookups, run the ingest. It worked, but every CLI invocation paid the Symfony boot cost, and the dependency graph carried symfony/console even though the framework no longer required it.

Now: Giiken loads the Waaseyaa CliKernel directly, registers its commands through the framework's command provider interface, and skips the Symfony layer entirely. Boot is faster (no double kernel), the dependency graph is smaller, and the test surface is one runtime instead of two.

The interesting part isn't the diff. It's the cascade. When the framework decoupled itself from Symfony in mission #1107, every downstream application got the option to do the same. Giiken took the option this week. The next downstream application will take less time to do it, because the seam already exists and the migration is documented.

Decoupling at the framework layer doesn't just pay off in the framework. It pays off in every consumer that no longer has to import the dependency the framework is no longer requiring.

https://github.com/waaseyaa/giiken/commit/b41be09

## Facebook

Giiken's CLI ingestion path is now Symfony-free. The new `giiken:ingest:file` command runs directly on the Waaseyaa-native CliKernel, skipping the Symfony Application layer that the previous implementation used.

This is the downstream cascade from mission #1107 in the framework, which decoupled the api package from Symfony. Giiken got to take the same step a few weeks later. The next downstream application takes less.

https://github.com/waaseyaa/giiken/commit/b41be09

#buildinpublic #waaseyaa
