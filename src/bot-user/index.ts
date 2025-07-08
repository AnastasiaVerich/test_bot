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
import { subscribeUser_notifyReservationEnd } from "./subscribe/notify_survey_reservation_end";
import { subscribeUser_notifyOperatorTakeSurvey } from "./subscribe/notify_operator_take_survey";
import { subscribeUser_notifySurveyFinish } from "./subscribe/notify_survey_finish";
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
    void subscribeUser_notifyOperatorTakeSurvey(bot);
    void subscribeUser_notifyReservationEnd(bot);
    void subscribeUser_notifySurveyFinish(bot);

    // Обработчик ошибок
    bot.catch((err) => {
      logger.info("Ошибка в боте:", err);
    });

    // Запуск бота
    await bot.start().then((res) => {});
  } catch (err) {
    console.log(err);
    logger.info("Ошибка в bootstrap:", err);
  }
}

bootstrap().catch((err) => {
  logger.info("Ошибка при запуске bootstrap:", err);
});
