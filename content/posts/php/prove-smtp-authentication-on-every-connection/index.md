---
categories:
    - php
date: 2026-10-30T00:00:00Z
draft: false
slug: prove-smtp-authentication-on-every-connection
summary: Treat SMTP authentication as connection state, require fresh proof after every handshake, and fail closed when a server tries to downgrade the protocol.
tags:
    - php
    - email
    - security
    - testing
title: Prove SMTP authentication on every connection
---

Ahnii!

An SMTP server advertising authentication is not the same as the client successfully authenticating. The first fact describes a capability. The second is security state that belongs to one connection.

This post follows a versioned Waaseyaa mail transport from its initial authenticated SMTP implementation through review-driven hardening. The useful lesson is broader than one library: require fresh authentication evidence after every handshake, including reconnects.

## Make transport selection explicit

Email configuration should name the transport it intends to use. Do not infer production delivery from a loose collection of environment variables.

The implementation accepted a bounded set of transports, including local capture, an in-memory test transport, a provider transport, and authenticated SMTP. SMTP configuration was validated before a connection could be attempted. It required a valid host, port, username, secret source, and supported authentication method.

Fail early on incomplete or ambiguous configuration. A value that looks unusual, such as the username `0`, must not disappear because a truthiness check mistakes it for an absent value.

## Establish a verified encrypted channel

Authentication credentials should only cross a channel whose peer has been verified.

The transport required STARTTLS and configured the socket to:

- Verify the peer certificate
- Verify the peer name
- Reject self-signed certificates
- Limit TLS negotiation to supported modern protocol versions

The socket itself also had to be a valid stream before TLS options were applied. That check turns an unexpected runtime value into a controlled failure instead of letting it reach lower-level networking calls.

Encryption is a prerequisite here, not proof of authentication. Keep those states separate.

## Track completed authentication, not advertised capability

The first implementation checked that the server advertised the requested AUTH mechanism before sending mail. That is a useful capability check, but review exposed a missing boundary: a reconnect creates a new protocol session.

A server can advertise AUTH on one connection, accept authentication, and then behave differently on the next connection. It can omit AUTH or attempt an EHLO-to-HELO downgrade. If the client remembers only what a previous server greeting advertised, it may confuse old connection state with current authorization.

The hardened transport instead records successful authentication only after the server returns the expected success response. It clears that state whenever a fresh greeting begins. Before a message is sent, the current connection must have completed its own authentication exchange.

That produces a simple invariant:

> Every connection that sends a message must independently prove successful authentication.

If a reconnect cannot satisfy that invariant, delivery stops. The client does not continue through a weaker HELO path.

## Protect both the envelope and the failure path

Mail safety extends beyond the connection handshake.

The transport rejected reserved routing headers supplied through message metadata so application input could not quietly replace envelope decisions. It also translated provider and SMTP exceptions into a stable delivery failure without attaching the original exception. That prevents credentials, server transcripts, and provider details from leaking through an exception chain.

Keep detailed diagnostics in an appropriately protected operational channel. Public application errors should describe the failed operation without replaying secrets or protocol conversations.

## Test protocol transitions, not only successful delivery

A happy-path SMTP test proves very little about reconnect behavior. Use a disposable test server that can control each protocol exchange and record what the client sent.

The qualification covered:

- LOGIN and XOAUTH2 success
- Missing or mismatched AUTH capabilities
- Invalid and falsey configuration values
- TLS verification failures
- A second connection that omits AUTH
- A second connection that tries to fall back from EHLO to HELO
- Redaction of the public failure surface

TLS tests ran the mail client in a separate PHP process so certificate authority configuration was present when the runtime initialized. That is a good general rule for tests involving process-start configuration: exercise the real boundary instead of mutating global state after initialization and assuming the result is equivalent.

The important outcome was not merely that authenticated SMTP worked. It was that authentication could not be inherited across connections, inferred from an advertisement, or bypassed through downgrade behavior.

Baamaapii
