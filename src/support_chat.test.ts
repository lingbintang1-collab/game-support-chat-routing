import assert from "node:assert/strict";
import { routeSupportMessage } from "./support_chat.ts";
import { RealtimeClient } from "./infra_realtime.ts";

const calls: Array<{ path: string; body?: Record<string, unknown> }> = [];
const fakeFetch = async (url: string, init: RequestInit) => {
  calls.push({ path: new URL(url).pathname, body: init.body ? JSON.parse(String(init.body)) : undefined });
  return new Response(JSON.stringify({ ok: true, data: {} }), { status: 200, headers: { "content-type": "application/json" } });
};

const client = new RealtimeClient("test-key", fakeFetch);
const routed = await routeSupportMessage(client, { playerId: "p1", assetId: "skin-9", text: "I found a cheat" });
assert.equal(routed.queue, "moderation");
assert.equal(calls[1].body?.event, "support.message.created");
assert.equal((calls[1].body?.data as { queue: string }).queue, "moderation");
console.log("support routing test passed");
