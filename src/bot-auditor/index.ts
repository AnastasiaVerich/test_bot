import { Bot } from "grammy";
import * as dotenv from "dotenv";

dotenv.config();
import { conversations } from "@grammyjs/conversations";

import logger from "../lib/logger";
import { client } from "../database/dbClient";
import { MyContext } from "../bot-common/types/type";
import { PsqlConversationAdapter } from "../services/psqlConversationAdapter";
import { errorMiddleware } from "../bot-common/middleware/errorMiddleware";
import { token_auditor } from "../config/env";
import {
  registerCallbackQueries,
  registerCommands,
  registerMessage,
} from "./handlers";
import { registerScenes } from "./scenes";

async function bootstrap() {
  try {
    await client.connect();

    const bot = new Bot<MyContext>(`${token_auditor}`);

    const conversationStorage = new PsqlConversationAdapter(
      client,
      "conversations_auditor",
    );
    await conversationStorage.init();

    bot.use(conversations({ storage: conversationStorage }));
    bot.use(errorMiddleware);

    registerCommands(bot);
    registerScenes(bot);
    registerCallbackQueries(bot);
    registerMessage(bot);

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
