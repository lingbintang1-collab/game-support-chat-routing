import { z } from "zod";
import { RealtimeClient } from "./infra_realtime.ts";

export const supportMessage = z.object({
  playerId: z.string().min(1),
  text: z.string().min(1).max(2000),
  assetId: z.string().min(1),
});
export type SupportMessage = z.infer<typeof supportMessage>;

export async function routeSupportMessage(client: RealtimeClient, input: unknown) {
  const message = supportMessage.parse(input);
  const channel = `player-support-${message.playerId}`;
  await client.createChannel(channel);
  await client.publish(channel, "support.message.created", {
    asset_id: message.assetId,
    text: message.text,
    queue: message.text.toLowerCase().includes("cheat") ? "moderation" : "support",
  }, message.playerId);
  return { channel, queue: message.text.toLowerCase().includes("cheat") ? "moderation" : "support" };
}
