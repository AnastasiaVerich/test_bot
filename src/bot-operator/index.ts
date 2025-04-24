import { Bot, session } from "grammy";
import * as dotenv from "dotenv";
dotenv.config();
import { conversations } from "@grammyjs/conversations";
import {token, token_operator} from "../config/env";
import { MyContext, SessionData } from "./types/type";
import { registerScenes } from "./scenes";
import { registerCallbackQueries, registerCommands, registerMessage } from "./handlers";
import logger from "../lib/logger";
import {client} from "../database/dbClient";
import {PsqlAdapter} from "@grammyjs/storage-psql";

// Начальные данные сессии
function initialSession(): SessionData {
    return {

    };
}


async function bootstrap() {
    try {

        await client.connect();

        const bot = new Bot<MyContext>(`${token_operator}`);
        const storageAdapter = await PsqlAdapter.create({ tableName: 'sessions_operator', client })

        // Инициализация сессий и разговоров
        bot.use(session({
            initial: initialSession,
            storage: storageAdapter,
        }));
        bot.use(conversations());
        // bot.use(errorMiddleware);

        registerScenes(bot);
        registerCommands(bot);
        registerCallbackQueries(bot);
        registerMessage(bot);

        // Обработчик ошибок
        bot.catch((err) => {
            console.error("Ошибка в боте:", err);
        });

        // Запуск бота
        console.log("7: Запуск бота");
        await bot.start().then((res) => {
            logger.info("Бот запущен:", res);
        });
    } catch (err) {
        console.error("Ошибка в bootstrap:", err);
    }
}

bootstrap().catch(err => {
    console.error("Ошибка при запуске bootstrap:", err);
});
