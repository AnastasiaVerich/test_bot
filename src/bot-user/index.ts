import {Bot, session} from "grammy";
import * as dotenv from "dotenv";
import {conversations} from "@grammyjs/conversations";
import {token} from "../config/env";
import {registerScenes} from "./scenes";
import {registerCallbackQueries, registerCommands, registerMessage} from "./handlers";
import logger from "../lib/logger";
import {client} from "../database/dbClient";
import {PsqlAdapter} from "@grammyjs/storage-psql";
import {MyContext, SessionData} from "../bot-common/types/type";
import {subscribeReservationEnded} from "./subscribe/reservation_ended";
import {subscribeOperatorAssigned} from "./subscribe/operator_assigned";
import {subscribeFinishSurveyNotification} from "./subscribe/finish_survey_notification";

dotenv.config();

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
    try {

        await client.connect();

        const bot = new Bot<MyContext>(`${token}`);
        const storageAdapter = await PsqlAdapter.create({ tableName: 'sessions', client })

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
        subscribeOperatorAssigned(bot);
        subscribeReservationEnded(bot);
        subscribeFinishSurveyNotification(bot);

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
