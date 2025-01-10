import { Context, SessionFlavor } from "grammy";
import { ConversationFlavor } from "@grammyjs/conversations";

// Определите форму нашей сессии.
export interface SessionData {
  some: number;
}

export type MyContext = Context &
  ConversationFlavor &
  SessionFlavor<SessionData>;

export interface LocationType {
  latitude: number;
  longitude: number;
}
