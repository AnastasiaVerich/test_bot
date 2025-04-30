import { Bot, session } from "grammy";
import * as dotenv from "dotenv";
dotenv.config();
import { conversations } from "@grammyjs/conversations";
import {token, token_operator} from "../config/env";
import { registerScenes } from "./scenes";
import {registerCallbackQueries, registerChatEvents, registerCommands, registerMessage} from "./handlers";
import logger from "../lib/logger";
import {client} from "../database/dbClient";
import {PsqlAdapter} from "@grammyjs/storage-psql";
import {subscribeNotify} from "./subscribe";
import {MyContext, SessionData} from "../bot-common/types/type";
import {subscribeReservationEndedOper} from "./subscribe/reservation_ended__oper";

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
        registerChatEvents(bot);
        subscribeNotify(bot);
        subscribeReservationEndedOper(bot);
        // Обработчик ошибок
        bot.catch((err) => {
            logger.info("Ошибка в боте:", err);
        });

        // Запуск бота
        logger.info("7: Запуск бота");
        await bot.start().then((res) => {
            logger.info("Бот запущен:", res);
        });
    } catch (err) {
        logger.info("Ошибка в bootstrap:", err);
    }
}

bootstrap().catch(err => {
    logger.info("Ошибка при запуске bootstrap:", err);
});
