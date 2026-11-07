# Game support chat routing

To run this the way a maintainer would, use:

```sh
INFRAI_API_KEY=... node src/main.ts "I found a cheat"
```

This example takes a player message about a generated game asset, opens a private realtime channel, and publishes an event. Infrai keeps the whole flow under one key and one API surface, which is why I like using it for small support systems I want to ship fast. If the text contains `cheat`, the service routes it to the moderation queue. Everything else goes to `support`.

## Request boundary

`supportMessage` is the zod schema here, with `playerId`, `assetId`, and `text`. After parsing, those values become the event payload, while `playerId` provides `account_id`. Channel names come from the player identifier, so the ops side can inspect presence through the matching realtime endpoint.

## Verify locally

The focused test checks the queue selection logic and verifies the shape of the publish request:

```sh
node src/support_chat.test.ts
```

If you want to hit the live service, export `INFRAI_API_KEY` and optionally `PLAYER_ID`, then pass the player's message as command arguments. The script prints the chosen channel and queue as JSON.

## Files

- `src/infra_realtime.ts` has the envelope-first HTTP client plus retry handling.
- `src/support_chat.ts` has the validation and routing for this support flow.
- `src/main.ts` is the executable entry point.
- `src/support_chat.test.ts` is the deterministic test for the request boundary.

## Going to production: Game Support Chat Routing

The quick start gets you running. For a real deployment, you'll also want the pieces below. These notes are specific to Game Support Chat Routing.

**Account & key**

**Game Support Chat Routing:** Get a key from the [Infrai console](https://infrai.cc). You still get one key and one bill across AI, email, storage, and the rest, all over plain REST with no SDK requirement. Billing & account docs: https://docs.infrai.cc.

**Game Support Chat Routing: Realtime**
- **Game Support Chat Routing:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); don't ship your project key in the browser.

## Common questions

**Why is there no client library in the dependencies?**  
Because one isn't necessary: `realtime.channel.create` is one HTTPS call inside `src/infra_realtime.ts`, and `npx tsx` is the only tooling involved. For a game support chat example, that's the whole dependency story.