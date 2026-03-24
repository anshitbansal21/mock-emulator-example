# Mocking vs Emulation Demo

Vercel has recently released a newer way of writing integraiton tests by moving away from traditional mocking to something which feels more real in nature - [vercel-labs/emulate](https://github.com/vercel-labs/emulate)
This mini repo compares two testing styles for API integrations:

1. **Traditional mocking**: stub `fetch` responses per call.
2. **Stateful emulation with `emulate`**: run a local API service that behaves like a backend.

## What this demonstrates

- Traditional mocks are fast and focused, but each response is handcrafted.
- Emulation gives realistic multi-step behavior (create, then list, then update) without restubbing every call.
- Emulation tests are closer to integration tests and can catch behavior mismatches hidden by mocks.

## Project layout

- `src/githubClient.js`: tiny client methods (`createRepo`, `listMyRepos`, `renameRepo`, `getRepo`)
- `tests/traditional.mocking.test.js`: tests using stubbed `fetch`
- `tests/emulate.stateful.test.js`: tests using `createEmulator({ service: "github" })`

## Run it

```bash
npm install
npm run test:traditional
npm run test:emulate
npm test
```

## What to observe

### Traditional mocking

In `tests/traditional.mocking.test.js`, this test passes:

- Create repo (mocked response says success)
- List repos (second mocked response returns empty array)

This can hide real integration issues because no real state exists unless you build it yourself.

### Emulation

In `tests/emulate.stateful.test.js`, state is real (in-memory backend):

- Create repo
- List repos includes the created repo
- Rename repo
- Fetch by new name succeeds

That is much closer to production behavior while still running locally/offline.

## Benefit / Tradeoff Summary

| Aspect | Traditional mocks | `emulate` stateful emulation |
|---|---|---|
| Speed | Very fast | Fast, slightly slower (server boot) |
| Setup complexity | Low for simple cases | Slightly higher upfront |
| Realism | Low-medium | High for covered endpoints |
| Stateful workflows | Manual, brittle | Built-in |
| Failure mode confidence | Can miss integration bugs | Better at catching flow regressions |
| Best use | Narrow unit tests | Integration-like tests in CI/local |

## Suggested practical approach

Use both:

- Keep **unit tests with mocks** for pure logic and edge-case forcing.
- Add **emulation tests** for critical API workflows (create/update/list/auth flows).

This gives fast feedback plus realistic behavior coverage.
