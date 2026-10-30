## Bluesky

An SMTP server advertising AUTH is not proof that the current connection authenticated. Clear auth state on every handshake, require a fresh successful exchange, and reject downgrade paths. https://jonesrussell.github.io/blog/prove-smtp-authentication-on-every-connection/ #PHP #Security

## LinkedIn

SMTP authentication is connection state, not a permanent property of the server.

Check the advertised mechanism, but record authentication only after the current handshake succeeds. Clear that state on reconnect, require fresh proof before sending, and fail closed if the server attempts a downgrade.

https://jonesrussell.github.io/blog/prove-smtp-authentication-on-every-connection/

#PHP #EmailSecurity #SoftwareTesting #SecurityEngineering

## Facebook

Authenticated SMTP needs a fresh proof on every connection. Clear authentication state on reconnect, require a successful exchange before sending, and reject downgrade paths instead of inheriting trust from an earlier session. https://jonesrussell.github.io/blog/prove-smtp-authentication-on-every-connection/ #PHP #Security
