import {Context, SessionFlavor} from "grammy";
import {ConversationFlavor} from "@grammyjs/conversations";
// Определите форму нашей сессии.
export interface SessionData {
    some: number;
}

export type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;

export type  Types = 'registration' | 'identification'

type ParamsVerification = {
    userPhone?: string,
    userId: string,
    isSavePhoto:'0'|'1',
    type: Types
}
export type ParamsType = ParamsVerification
