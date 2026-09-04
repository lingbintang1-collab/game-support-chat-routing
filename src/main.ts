import { RealtimeClient } from "./infra_realtime.ts";
import { routeSupportMessage } from "./support_chat.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");

const payload = { playerId: process.env.PLAYER_ID ?? "player-42", assetId: "level-7", text: process.argv.slice(2).join(" ") || "My level is stuck" };
const result = await routeSupportMessage(new RealtimeClient(key), payload);
console.log(JSON.stringify(result));
