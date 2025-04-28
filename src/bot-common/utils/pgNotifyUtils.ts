import { Client } from "pg";
import { Bot } from "grammy";
import { MyContext } from "../types/type";
import {pgConfig} from "../../database/dbClient";
import logger from "../../lib/logger";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectPgClient(client: Client, name: string): Promise<void> {
    try {
        await client.connect();
        logger.info(`Подключен ${name} к PostgreSQL`);
    } catch (err) {
        logger.info(`Ошибка подключения ${name} к PostgreSQL:`, err);
        throw err;
    }
}

export async function sendMessageWithRetry(
    bot: Bot<MyContext>,
    chatId: number | string,
    message: string,
    maxAttempts = 3
): Promise<number | null> {
    let attempt = 1;
    while (attempt <= maxAttempts) {
        try {
            const result = await bot.api.sendMessage(chatId, message);
            logger.info(`Сообщение отправлено, message_id: ${result.message_id}, попытка: ${attempt}`);
            return result.message_id;
        } catch (error) {
            logger.info(`Попытка ${attempt} не удалась: ${error}`);
            if (attempt === maxAttempts) {
                logger.info("Не удалось отправить сообщение");
                return null;
            }
            await sleep(1000);
            attempt++;
        }
    }
    return null;
}

export async function subscribeToNotifications(client: Client, channel: string): Promise<void> {
    try {
        await client.query(`LISTEN ${channel}`);
        logger.info(`Подписка на ${channel} установлена`);
    } catch (err) {
        logger.info(`Ошибка при подписке на ${channel}:`, err);
        throw err;
    }
}

export async function checkMissedRecords<T>(
    client: Client,
    bot: Bot<MyContext>,
    query: string,
    processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>
): Promise<void> {
    try {
        const result = await client.query(query);
        for (const record of result.rows as T[]) {
            logger.info(`Обработка пропущенной записи`);
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
    processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>
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
        void reconnectNotifyClient(client, bot, channel, processRecord);
    });
}

export async function reconnectNotifyClient<T>(
    client: Client,
    bot: Bot<MyContext>,
    channel: string,
    processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>
): Promise<void> {
    logger.info("Соединение с PostgreSQL закрыто. Переподключение...");
    try {
        await connectPgClient(client, "клиент уведомлений");
        await subscribeToNotifications(client, channel);
        await checkMissedRecords(client, bot, `/* соответствующий SQL-запрос */`, processRecord);
    } catch (err) {
        logger.info("Ошибка переподключения:", err);
        setTimeout(() => reconnectNotifyClient(client, bot, channel, processRecord), 5000);
    }
}

export async function subscribeToChannel<T>(
    bot: Bot<MyContext>,
    channel: string,
    query: string,
    processRecord: (bot: Bot<MyContext>, record: T) => Promise<void>
): Promise<void> {
    const pgClient = new Client(pgConfig);
    const pgNotifyClient = new Client(pgConfig);
    try {
        await connectPgClient(pgClient, "основной клиент");
        await connectPgClient(pgNotifyClient, "клиент уведомлений");
        await subscribeToNotifications(pgNotifyClient, channel);
        handleNotifications(pgNotifyClient, bot, channel, processRecord);
        await checkMissedRecords(pgClient, bot, query, processRecord);
    } catch (err) {
        logger.info("Ошибка инициализации:", err);
        process.exit(1);
    }
}
