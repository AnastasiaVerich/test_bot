import { Bot, session } from "grammy";
import * as dotenv from "dotenv";

dotenv.config(); // Загрузка переменных окружения
import { conversations } from "@grammyjs/conversations";
import { token } from "../config/env";
import { MyContext, SessionData } from "./types/type";
import { registerScenes } from "./scenes";

import {
  registerCallbackQueries,
  registerCommands,
  registerMessage,
} from "./handlers";
import { errorMiddleware } from "./middleware/errorMiddleware";
import logger from "../lib/logger";

// Конфигурация сессий
function initial(): SessionData {
  return { some: 0 };
}

// Создаем бота
const bot = new Bot<MyContext>(`${token}`);

// Инициализация сессий и разговоров
bot.use(session({ initial })); //добавляет объект ctx.session в контекст (ctx)
bot.use(conversations<MyContext>());
bot.use(errorMiddleware); // Для обработки ошибок

registerScenes(bot);
registerCommands(bot);
registerCallbackQueries(bot);
registerMessage(bot);

// Запуск бота
bot
  .start()
  .then((res) => {
    logger.info(res);
  })
  .catch((error) => {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error(shortError);
  });
