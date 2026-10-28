---
categories:
    - php
date: 2026-10-28T00:00:00Z
devto_id: 4934808
draft: false
slug: track-campaign-conversions-without-contact-data
summary: Measure which registered campaign links lead to saved contact messages without copying personal details into analytics.
tags:
    - php
    - analytics
    - privacy
    - testing
title: Track campaign conversions without storing contact details
---

Ahnii!

Campaign attribution usually starts with a simple question: which shared link led to a useful action? The implementation gets risky when analytics and contact data start bleeding into each other.

This post covers a narrower design: count landings and saved contact messages for registered campaigns while keeping names, email addresses, messages, raw query strings, and visitor identifiers out of the conversion table.

## Register campaigns instead of accepting arbitrary tags

Do not treat every UTM value as trusted analytics data. Use a finite registry that binds one internal campaign key to the exact public route and exact tag set you expect.

That boundary gives you several useful properties:

- Unknown tags never become campaign labels.
- Duplicate or partial parameters do not create attribution.
- A valid tag set on the wrong route is rejected.
- Test campaigns can be marked and excluded from production totals.
- Click IDs and unrelated query parameters never enter storage.

The browser only carries the internal key after the complete registered link matches. This keeps reporting labels under editorial control instead of letting arbitrary request data shape your analytics.

## Keep attribution short-lived and same-tab

For a contact form reached after a landing page, you need a small amount of continuity. You do not need a durable visitor profile.

The implementation stores a registered campaign key and a 30-minute expiry in same-tab session storage. A second valid campaign replaces the first. Invalid explicit campaign tags clear the old value. When session storage is unavailable, attribution can remain in memory for the current page and then disappear.

This is deliberately limited:

- There is no analytics cookie.
- There is no cross-tab identity.
- There is no name, email, message, or raw URL in the attribution state.
- Do Not Track or Global Privacy Control clears the state and disables collection.

Those limits mean the report is not a complete readership count. That is acceptable when the goal is directional campaign measurement, not surveillance.

## Count conversions only after the contact is saved

A public analytics collector should never be allowed to claim that a conversion happened. The server already knows when the contact form passes validation, rate limiting, bot checks, and persistence.

Record the conversion at that trusted boundary. In this implementation, the contact row and conversion event are written inside the same database transaction. If the conversion write fails, the tracked contact save rolls back too. The response cannot report success for a message while silently losing its associated measurement.

The conversion event contains only:

- The event type
- A known campaign key or `null`
- A random event key
- A timestamp

The contact record keeps the personal information needed for a reply. The analytics table does not receive the contact row ID or any contact content.

## Deduplicate landings without creating a visitor profile

Repeated delivery of the same pageview can happen through retries or browser behaviour. A random pageview ID can be hashed into an event key so the same landing is counted once.

That key is scoped to deduplication. It is not reused to join the landing to a person, a contact record, or activity on another day. The report aggregates campaign landings and saved messages without exposing an individual journey.

## Test the refusal paths

The useful tests are not only the happy path. Prove that the boundaries hold when inputs are incomplete or hostile.

Cover at least these cases:

- Unknown, duplicate, partial, expired, and wrong-route campaign tags are rejected.
- Do Not Track and Global Privacy Control prevent analytics while the contact form still works.
- Bots, invalid forms, honeypots, and rate-limited requests do not count as conversions.
- The public collector cannot submit a conversion event.
- Repeated delivery of one pageview counts one landing.
- Analytics failure rolls back a tracked contact save.
- Stored analytics rows contain no email address or message text.
- Test campaigns stay out of production totals.

This design does not prove that someone saw the original social post. Reshares keep the same registered tag, scripts can be blocked, and privacy choices reduce the count. Report visits and saved messages for a link, not unique people or causal certainty.

Baamaapii
