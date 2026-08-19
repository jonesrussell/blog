Queue-Issue: #362
Reference URL: https://github.com/jonesrussell/jonesrussell/issues/362

## Bluesky

Generic CMSes model genealogy as just another content type. The waaseyaa/genealogy package goes further: GenealogyPerson, GenealogyTree, pedigree services, and living-person semantics built in. https://github.com/waaseyaa/framework/commit/d9b7cf9 #buildinpublic #phpdev

## LinkedIn

If you are building digital tools for Indigenous communities, kinship is not a metadata field. It is the data.

Waaseyaa's new genealogy package treats family structure as a framework-level concern, not a content-type workaround. Commit d9b7cf9 introduces waaseyaa/genealogy with four entities (GenealogyPerson, GenealogyFamily, GenealogyTree, GenealogyEvent), two access policy classes, and a 274-line pedigree service that handles ancestor traversal.

Living-person semantics are built in via GenealogyLivingSemantics -- not as a config flag, but as a typed class in the access layer. That distinction matters when your data subjects include living elders.

The package integrates with Waaseyaa's field system via FieldDefinitionRegistry::mergeCoreFields, so genealogy entities use the same field inheritance as any other entity type in the framework. No special-casing required.

SSR routes via GenealogySsrController ship with ancestor chart, neighbor list, and layout Twig templates. You get rendered views without wiring your own controllers.

This landed as part of building Minoo, an Indigenous language and community platform, on top of Waaseyaa.

https://github.com/waaseyaa/framework/commit/d9b7cf9

#waaseyaa #phpdev #buildinpublic #indigenoustech #php

## Facebook

If you track family relationships in software, you know how fast a generic content model breaks down. Pedigree traversal, living-person privacy, and relationship types do not fit neatly into tags and categories.

The new waaseyaa/genealogy package models these as first-class framework concerns. It ships entities for person, family, tree, and event; a pedigree service for ancestor traversal; living-person semantics as a typed access class; and SSR routes with Twig templates ready to use. Field definitions share the same inheritance system as every other entity type in Waaseyaa, so you are not maintaining a separate integration layer.

This is part of the work going into Minoo, an Indigenous language and community platform built on Waaseyaa. https://github.com/waaseyaa/framework/commit/d9b7cf9 #buildinpublic
