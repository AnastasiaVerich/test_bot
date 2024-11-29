import {Bot, Context, MemorySessionStorage, session, SessionFlavor} from "grammy";
import { registerMessageHandler } from "./handlers/callbackQueries/messages";
import * as dotenv from 'dotenv';
dotenv.config();//обязательно тут
import {registerCallbackQueries, registerCommands} from "./handlers";
import {registerScenes} from "./scenes";
import {ConversationFlavor, conversations} from "@grammyjs/conversations";
import {token, WEB_APP_URL} from "./config/config";

export type MyContext = Context & ConversationFlavor & SessionFlavor<SessionData>;



// Определите форму нашей сессии.
interface SessionData {
    some: number;
}

const bot = new Bot<MyContext>(`${token}`);

function initial(): SessionData {
    return { some: 0 };
}

// Подключаем middleware для сессий
bot.use(session({ initial }));
bot.use(conversations<MyContext>());

// Регистрация сцен
registerScenes(bot)

// Регистрация обработчиков
registerCommands(bot);
registerCallbackQueries(bot);
//registerMessageHandler(bot);


// Запуск бота
bot.start();
