import { Context, SessionFlavor } from "grammy";
import {Conversation, ConversationFlavor} from "@grammyjs/conversations";
// Определите форму нашей сессии.
export interface SessionData {
    [key: string]: any; // Для хранения состояния сцен
}

// Внутренний контекст для сцен (с сессией, без разговоров)
export type MyConversationContext = Context & SessionFlavor<SessionData>;

// Внешний контекст для middleware (с сессией и разговорами)
export type MyContext = MyConversationContext & ConversationFlavor<MyConversationContext>;

export type MyConversation = Conversation<MyContext, MyConversationContext>;

export interface LocationType {
    latitude: number;
    longitude: number;
}
