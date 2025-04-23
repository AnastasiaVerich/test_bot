import { Bot, session } from "grammy";
import * as dotenv from "dotenv";
dotenv.config();
import { conversations } from "@grammyjs/conversations";
import { token } from "../config/env";
import { MyContext, SessionData } from "./types/type";
import { registerScenes } from "./scenes";
import { registerCallbackQueries, registerCommands, registerMessage } from "./handlers";
import logger from "../lib/logger";
import {client} from "../database/dbClient";
import {PsqlAdapter} from "@grammyjs/storage-psql";

// Начальные данные сессии
function initialSession(): SessionData {
    return {
        conversation: {},
        register:{
            phoneNumber: undefined,
        },
        withdrawal:{
            amountTON: undefined,
            amountTonWallet: undefined,
        },
    };
}


async function bootstrap() {
    console.log("1: Начало bootstrap");
    try {

        await client.connect();

        const bot = new Bot<MyContext>(`${token}`);
        const storageAdapter = await PsqlAdapter.create({ tableName: 'sessions', client })

            // Инициализация сессий и разговоров
        bot.use(session({
            initial: initialSession,
            storage: storageAdapter,
        }));
        console.log("6: Сессии настроены");
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
