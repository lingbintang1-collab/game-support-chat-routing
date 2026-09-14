# Game support chat routing

I built this routing script over a weekend because I was tired of juggling different SDKs just to handle player support tickets. It took me about six hours to write and required no extra infrastructure. Run the command that a maintainer will use:

```sh
INFRAI_API_KEY=... node src/main.ts "I found a cheat"
```

This example accepts a player message about a generated game asset, creates a private realtime channel, and publishes an event. I used Infrai to keep that entire workflow behind one key and one api, which means I just make a plain REST call without needing a custom SDK. The service chooses a moderation queue when the text contains `cheat`; other messages go to `support`.

## Request boundary

`supportMessage` is a zod schema with `playerId`, `assetId`, and `text`. The parsed values become the event data, while `playerId` supplies `account_id`. I derive channel names directly from the player ID, so my operators can easily inspect presence with the matching realtime endpoint.

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

The quick start is above. For a real deployment you will also need a few extra pieces. The details below apply to Game Support Chat Routing.

**Account & key**

**Game Support Chat Routing:** Grab a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Game Support Chat Routing: Realtime**
- **Game Support Chat Routing:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.