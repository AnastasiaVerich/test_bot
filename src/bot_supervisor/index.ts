import {Bot, session} from "grammy";
import * as dotenv from "dotenv";
import {conversations} from "@grammyjs/conversations";
import {token_supervisor} from "../config/env";
import {registerCallbackQueries, registerCommands, registerMessage} from "./handlers";
import logger from "../lib/logger";
import {client} from "../database/dbClient";
import {PsqlAdapter} from "@grammyjs/storage-psql";
import {MyContext, SessionData} from "../bot-common/types/type";
import {errorMiddleware} from "../bot-common/middleware/errorMiddleware";
import {registerScenes} from "./scenes";

dotenv.config();

// Начальные данные сессии
function initialSession(): SessionData {
    return {

    };
}


async function bootstrap() {
    try {

        await client.connect();

        const bot = new Bot<MyContext>(`${token_supervisor}`);
        const storageAdapter = await PsqlAdapter.create({ tableName: 'sessions_supervisor', client })

            // Инициализация сессий и разговоров
        bot.use(session({
            initial: initialSession,
            storage: storageAdapter,
        }));
        bot.use(conversations());
        bot.use(errorMiddleware);

        registerScenes(bot);
        registerCommands(bot);
        registerMessage(bot);
        registerCallbackQueries(bot);

        // Обработчик ошибок
        bot.catch((err) => {
            logger.info("Ошибка в боте:", err);
        });

        // Запуск бота
        await bot.start().then((res) => {});
    } catch (err) {
        logger.info("Ошибка в bootstrap:", err);
    }
}

bootstrap().catch(err => {
    logger.info("Ошибка при запуске bootstrap:", err);
});
