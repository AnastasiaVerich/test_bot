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
export interface LocationType {latitude:number, longitude:number}

export interface InterfaceResponse<T> {
    status: 0 | 1 | 2; // Статус выполнения запроса
    text: T; // Сообщение, которое передается в ответе
    [key: string]: any; // Дополнительные данные, которые могут быть в ответе
}
