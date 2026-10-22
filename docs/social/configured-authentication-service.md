# Do not construct authentication policy inside a login helper

## Bluesky

A locally constructed auth manager may verify a password while skipping eligibility, session, or credential-upgrade policy. Inject the configured service and test the whole HTTP path. https://jonesrussell.github.io/blog/configured-authentication-service/ #PHP #Security

## LinkedIn

A login helper can verify the right password and still bypass part of your authentication policy.

If it constructs an authentication manager directly, it may lose the eligibility checks, password upgrades, session rules, and account-principal factory configured by the application.

I wrote up a practical boundary: inject the configured authentication service, use HTTP principals for permission checks, fail loudly when policy services are missing, and test login through session revocation and logout. https://jonesrussell.github.io/blog/configured-authentication-service/

#PHP #Authentication #Security #SoftwareTesting

## Facebook

Do not treat your authentication manager as a password-checking utility.

A locally constructed instance may skip eligibility rules, credential upgrades, session generation, or the principal used for HTTP authorization. Resolve the configured service once, inject it, and test the complete login contract. https://jonesrussell.github.io/blog/configured-authentication-service/

#PHP #Security
