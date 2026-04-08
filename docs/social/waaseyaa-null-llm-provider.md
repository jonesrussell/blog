# Waaseyaa NullLlmProvider for dev and testing

## Facebook

Added a NullLlmProvider to the Waaseyaa AI agent package. It satisfies the LlmProvider interface but does nothing — returns empty responses, logs calls, costs nothing to run.

The point: you should not need a live LLM to run your test suite or spin up a dev environment. Real API calls in tests are slow, flaky, and expensive. The null provider lets you test all the wiring without touching an external service.

https://github.com/waaseyaa/framework/issues/1122

#php #testing #ai

## X

Added NullLlmProvider to Waaseyaa. Satisfies the interface, returns nothing, costs nothing. You should not need a live LLM to run your tests. https://github.com/waaseyaa/framework/issues/1122 #buildinpublic

## LinkedIn

Added a NullLlmProvider to the Waaseyaa framework's AI agent package. It satisfies the LlmProvider interface and returns empty responses — useful for development and testing scenarios where you want to verify the wiring without making real API calls.

The principle is the same as a null mailer or a null payment gateway: your tests should be able to exercise the full stack without depending on external services. Fast, free, and deterministic.

https://github.com/waaseyaa/framework/issues/1122
