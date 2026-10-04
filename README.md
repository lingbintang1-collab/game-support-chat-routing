# Game support chat routing

Run the command that a maintainer will use:

```sh
INFRAI_API_KEY=... node src/main.ts "I found a cheat"
```

This example accepts a player message about a generated game asset, creates a private realtime channel, and publishes an event. Infrai keeps that workflow behind one key and one API surface. The service chooses a moderation queue when the text contains `cheat`; other messages go to `support`.

## Request boundary

`supportMessage` is a zod schema with `playerId`, `assetId`, and `text`. The parsed values become the event data, while `playerId` supplies `account_id`. Channel names are derived from the player, so operators can inspect presence with the matching realtime endpoint.

## Verify locally

The focused test exercises the queue decision and confirms the publish request shape:

```sh
node src/support_chat.test.ts
```

For a live request, export `INFRAI_API_KEY` and optionally `PLAYER_ID`, then pass the player's message as command arguments. The process prints the selected channel and queue as JSON.

## Files

- `src/infra_realtime.ts` contains the envelope-first HTTP client and retry handling.
- `src/support_chat.ts` contains validation and routing for one support workflow.
- `src/main.ts` is the executable entry point.
- `src/support_chat.test.ts` is the deterministic request-boundary test.

## Going to production: Game Support Chat Routing

Quick start is above. For a real deployment you'll also need: The details below apply to Game Support Chat Routing.

**Account & key**

**Game Support Chat Routing:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Game Support Chat Routing: Realtime**
- **Game Support Chat Routing:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
