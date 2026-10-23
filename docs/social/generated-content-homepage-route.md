# Do not let generated content replace your homepage

## Bluesky

A generator can return HTTP 200 and still replace your homepage with a content index. Give root-level collections a stable bundle path, refuse collisions, and test which template answered. https://jonesrussell.github.io/blog/generated-content-homepage-route/ #PHP #Testing

## LinkedIn

A content generator can produce valid routes and still erase the application homepage you started with.

The trap is a detail route like /{slug}. Strip the slug to derive a collection route and you get /. A generated index can then take ownership of the root while every smoke test still sees HTTP 200.

I wrote up a safer contract: keep root-level details, move their collection to the bundle path, refuse literal collisions before publication, and test which template answered each URL. https://jonesrussell.github.io/blog/generated-content-homepage-route/

#PHP #Routing #SoftwareTesting #CodeGeneration

## Facebook

HTTP 200 does not prove your generated site kept its homepage.

If /{slug} details cause the generator to register their collection at /, the content index can replace the starter homepage without producing an error. Reserve root ownership, derive a bundle collection path, and test the composed application. https://jonesrussell.github.io/blog/generated-content-homepage-route/

#PHP #Testing
