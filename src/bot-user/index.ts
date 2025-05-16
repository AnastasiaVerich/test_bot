import { Bot } from "grammy";
import * as dotenv from "dotenv";
import { conversations } from "@grammyjs/conversations";
import { token_user } from "../config/env";
import { registerScenes } from "./scenes";
import {
  registerCallbackQueries,
  registerCommands,
  registerMessage,
} from "./handlers";
import logger from "../lib/logger";
import { client } from "../database/dbClient";
import { MyContext } from "../bot-common/types/type";
import { subscribeReservationEnded } from "./subscribe/reservation_ended";
import { subscribeOperatorAssigned } from "./subscribe/operator_assigned";
import { subscribeFinishSurveyNotification } from "./subscribe/finish_survey_notification";
import { errorMiddleware } from "../bot-common/middleware/errorMiddleware";
import { PsqlConversationAdapter } from "../services/psqlConversationAdapter";

dotenv.config();

async function bootstrap() {
  try {
    await client.connect();

    const bot = new Bot<MyContext>(`${token_user}`);

    const conversationStorage = new PsqlConversationAdapter(
      client,
      "conversations_user",
    );
    await conversationStorage.init();

    bot.use(conversations({ storage: conversationStorage }));
    bot.use(errorMiddleware);

    registerCommands(bot);
    registerScenes(bot);
    registerCallbackQueries(bot);
    registerMessage(bot);
    void subscribeOperatorAssigned(bot);
    void subscribeReservationEnded(bot);
    void subscribeFinishSurveyNotification(bot);

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

bootstrap().catch((err) => {
  logger.info("Ошибка при запуске bootstrap:", err);
});
