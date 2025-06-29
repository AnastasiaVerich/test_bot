import { Bot } from "grammy";
import * as dotenv from "dotenv";
import { conversations } from "@grammyjs/conversations";
import { token_supervisor } from "../config/env";
import {
  registerCallbackQueries,
  registerCommands,
  registerMessage,
} from "./handlers";
import logger from "../lib/logger";
import { client } from "../database/dbClient";
import { MyContext } from "../bot-common/types/type";
import { errorMiddleware } from "../bot-common/middleware/errorMiddleware";
import { registerScenes } from "./scenes";
import { PsqlConversationAdapter } from "../services/psqlConversationAdapter";
import { subscribeSupervisor_newPhotoAdded } from "./subscribe/new_photo";

dotenv.config();

async function bootstrap() {
  try {
    await client.connect();

    const bot = new Bot<MyContext>(`${token_supervisor}`);

    const conversationStorage = new PsqlConversationAdapter(
      client,
      "conversations_supervisor",
    );
    await conversationStorage.init();

    bot.use(conversations({ storage: conversationStorage }));
    bot.use(errorMiddleware);

    registerCommands(bot); //ТОЛЬКО
    registerScenes(bot); //В
    registerMessage(bot); //ТАКОМ
    registerCallbackQueries(bot); //ПОРЯДКЕ

    void subscribeSupervisor_newPhotoAdded(bot);
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
