import { Client } from "pg";
import { Bot, InlineKeyboard, InputFile, Keyboard } from "grammy";
import { MyContext } from "../types/type";
import { pgConfig } from "../../database/dbClient";
import logger from "../../lib/logger";

export const sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function connectPgClient(
  client: Client,
  name: string,
): Promise<void> {
  try {
    await client.connect();
  } catch (err) {
    logger.info(`Ошибка подключения ${name} к PostgreSQL:`, err);
    throw err;
  }
}

export async function sendMessageWithRetry(
  bot: Bot<MyContext>,
  message: string,
  chatId: number | string,
  keyboard: InlineKeyboard | Keyboard | undefined = undefined,
  maxAttempts = 3,
): Promise<number | null> {
  let attempt = 1;
  while (attempt <= maxAttempts) {
    try {
      const result = await bot.api.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
      return result.message_id;
    } catch (error) {
      logger.info(`Попытка ${attempt} не удалась: ${error}`);
      if (attempt === maxAttempts) {
        return null;
      }
      await sleep(1000);
      attempt++;
    }
  }
  return null;
}

export async function sendPhotoMessageWithRetry(
  bot: Bot<MyContext>,
  message: string,
  chatId: number | string,
  file: InputFile,
  maxAttempts = 3,
): Promise<string | null> {
  let attempt = 1;
  while (attempt <= maxAttempts) {
    try {
      const result = await bot.api.sendPhoto(chatId, file, {
        caption: message,
        parse_mode: "HTML",
      });
      return result?.photo?.[0]?.file_id ?? null;
    } catch (error) {
      logger.info(`Попытка ${attempt} не удалась: ${error}`);
      if (attempt === maxAttempts) {
        return null;
      }
      await sleep(1000);
      attempt++;
    }
  }
  return null;
}

export async function subscribeToNotifications(
  client: Client,
  channel: string,
): Promise<void> {
  try {
    await client.query(`LISTEN ${channel}`);
  } catch (err) {
    logger.info(`Ошибка при подписке на ${channel}:`, err);
    throw err;
  }
}

export async function checkMissedRecords<T>(
  bot: Bot<MyContext>,
  query: () => any,
  processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>,
): Promise<void> {
  try {
    const result = await query();
    for (const record of result as T[]) {
      await processRecord(bot, record);
    }
  } catch (error) {
    logger.info("Ошибка при проверке пропущенных записей:", error);
  }
}

export function handleNotifications<T>(
  client: Client,
  bot: Bot<MyContext>,
  channel: string,
  processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>,
  query: (() => any) | null,
): void {
  client.on("notification", async (msg) => {
    if (msg.channel === channel && msg.payload) {
      try {
        const record: T = JSON.parse(msg.payload);
        await processRecord(bot, record);
      } catch (error) {
        logger.info("Ошибка при обработке уведомления:", error);
      }
    }
  });
  client.on("error", (error) => {
    logger.info("Ошибка клиента уведомлений:", error);
    void reconnectNotifyClient(client, bot, channel, processRecord, query);
  });
}

export async function reconnectNotifyClient<T>(
  client: Client,
  bot: Bot<MyContext>,
  channel: string,
  processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>,
  query: (() => any) | null,
): Promise<void> {
  try {
    await connectPgClient(client, "клиент уведомлений");
    await subscribeToNotifications(client, channel);
    if (query) {
      await checkMissedRecords(bot, query, processRecord);
    }
  } catch (err) {
    logger.info("Ошибка переподключения:", err);
    setTimeout(
      () => reconnectNotifyClient(client, bot, channel, processRecord, query),
      5000,
    );
  }
}

export async function subscribeToChannel<T>(
  bot: Bot<MyContext>,
  channel: string,
  query: (() => any) | null,
  processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>,
): Promise<void> {
  const pgClient = new Client(pgConfig);
  const pgNotifyClient = new Client(pgConfig);
  try {
    await connectPgClient(pgClient, "основной клиент");
    await connectPgClient(pgNotifyClient, "клиент уведомлений");
    await subscribeToNotifications(pgNotifyClient, channel);
    handleNotifications(pgNotifyClient, bot, channel, processRecord, query);
    if (query) {
      await checkMissedRecords(bot, query, processRecord);
    }
  } catch (err) {
    logger.info("Ошибка инициализации:", err);
    process.exit(1);
  }
}
