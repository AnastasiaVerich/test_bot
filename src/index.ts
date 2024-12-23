import {Bot, session} from "grammy";
import * as dotenv from 'dotenv';

dotenv.config(); // Загрузка переменных окружения
import {conversations} from "@grammyjs/conversations";
import {token} from "./config/config";
import {MyContext, SessionData} from "./types/type";
import {registerScenes} from "./bot/scenes";
import {registerCallbackQueries} from "./bot/handlers/callbackQueries";
import {registerCommands} from "./bot/handlers/commands";


// Конфигурация сессий
function initial(): SessionData {
    return {some: 0};
}

// Создаем бота
const bot = new Bot<MyContext>(`${token}`);

// Инициализация сессий и разговоров
bot.use(session({initial}));
bot.use(conversations<MyContext>());

// Регистрация сцен
registerScenes(bot)

// Регистрация команд обработчиков
registerCommands(bot);
registerCallbackQueries(bot);/*
registerMessageHandler(bot);*/

// Запуск бота
bot.start();
