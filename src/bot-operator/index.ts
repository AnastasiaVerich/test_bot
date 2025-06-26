import { Bot } from "grammy";
import * as dotenv from "dotenv";

dotenv.config();
import { conversations } from "@grammyjs/conversations";
import { token_operator } from "../config/env";
import { registerScenes } from "./scenes";
import {
  registerCallbackQueries,
  registerChatEvents,
  registerCommands,
  registerMessage,
} from "./handlers";
import logger from "../lib/logger";
import { client } from "../database/dbClient";
import { subscribeOperator_newFreeSurvey } from "./subscribe/new_free_survey";
import { MyContext } from "../bot-common/types/type";
import { subscribeOperator_reservationSurveyEnded } from "./subscribe/notify_survey_reservation_ended";
import { PsqlConversationAdapter } from "../services/psqlConversationAdapter";
import { errorMiddleware } from "../bot-common/middleware/errorMiddleware";
import { subscribeOperator_notifyRecheckSurvey } from "./subscribe/notify_need_recheck_survey";

async function bootstrap() {
  try {
    await client.connect();

    const bot = new Bot<MyContext>(`${token_operator}`);

    const conversationStorage = new PsqlConversationAdapter(
      client,
      "conversations_operator",
    );
    await conversationStorage.init();

    bot.use(conversations({ storage: conversationStorage }));
    bot.use(errorMiddleware);

    registerCommands(bot);
    registerScenes(bot);
    registerCallbackQueries(bot);
    registerMessage(bot);
    registerChatEvents(bot);

    void subscribeOperator_newFreeSurvey(bot);
    void subscribeOperator_reservationSurveyEnded(bot);
    void subscribeOperator_notifyRecheckSurvey(bot);
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
