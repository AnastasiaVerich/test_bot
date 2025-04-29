import {Client} from "pg";
import {pgConfig} from "../../database/dbClient";
import {Bot} from "grammy";
import {SurveyActive, updateActiveSurveyIsJoinedToChat} from "../../database/queries/surveyQueries";
import {MyContext} from "../../bot-common/types/type";
import logger from "../../lib/logger";
import {findOperator} from "../../database/queries/operatorQueries";

const pgNotifyClient = new Client(pgConfig);
const pgClient = new Client(pgConfig);

// Подключение к PostgreSQL
async function connectPgClient(client: Client, name: string): Promise<void> {
    try {
        await client.connect();
        logger.info(`Подключен ${name} к PostgreSQL`);
    } catch (err) {
        logger.error(`Ошибка подключения ${name} к PostgreSQL:`, err);
        throw err;
    }
}

// Функция подписки на уведомления
async function subscribeToNotifications(): Promise<void> {
    try {
        await pgNotifyClient.query("LISTEN operator_assigned");
        logger.info("Подписка на operator_assigned установлена");
    } catch (err) {
        logger.error("Ошибка при подписке на уведомления:", err);
        throw err;
    }
}

// Задержка для повторных попыток
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Функция отправки сообщения с тремя попытками
async function sendMessageWithRetry(bot: Bot<MyContext>,message: string,chatId:number): Promise<number | null> {
    const maxAttempts = 3;
    let attempt = 1;
    logger.info(chatId)

    while (attempt <= maxAttempts) {
        try {
            const result = await bot.api.sendMessage(chatId, message);
            logger.info(`Сообщение успешно отправлено в канал, message_id: ${result.message_id}, попытка: ${attempt}`);
            return result.message_id;
        } catch (error) {
            logger.info(`Попытка ${attempt} не удалась: ${error}`);
            if (attempt === maxAttempts) {
                logger.error("Не удалось отправить сообщение после всех попыток");
                return null;
            }
            await sleep(1000); // Задержка 1 секунда перед следующей попыткой
            attempt++;
        }
    }
    return null;
}

// Функция обработки записи
async function processRecord(bot: Bot<MyContext>,record: SurveyActive): Promise<void> {
    const { survey_active_id, user_id,operator_id, created_at } = record;

    const operator = await findOperator(operator_id,null,null)
    const message =`Напишите оператору: @${operator?.tg_account}`

    try {
        // Отправка сообщения и получение message_id
        const messageId = await sendMessageWithRetry(bot,message,user_id);
        await updateActiveSurveyIsJoinedToChat(true, survey_active_id)


        if (messageId !== null) {
            // Обновление message_id в таблице survey_active
            logger.info(`Сообщение для записи ${survey_active_id} отправлено, message_id: ${messageId}`);
        } else {
            logger.error(`Не удалось обновить запись ${survey_active_id}: сообщение не отправлено`);
        }
    } catch (error) {
        logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

// Функция проверки пропущенных записей
async function checkMissedRecords(bot: Bot<MyContext>): Promise<void> {
    try {
        const result = await pgClient.query(`
            SELECT *
            FROM survey_active
            WHERE operator_id IS NOT NULL
            AND is_user_notified IS FALSE
            ORDER BY created_at ASC
    `);

        for (const record of result.rows as SurveyActive[]) {
            logger.info(`Обработка пропущенной записи: ${record.survey_active_id}`);
            await processRecord(bot,record);
        }
    } catch (error) {
        logger.error("Ошибка при проверке пропущенных записей:", error);
    }
}

// Обработка уведомлений
function handleNotifications(bot: Bot<MyContext>): void {
    pgNotifyClient.on("notification", async (msg) => {
        logger.info('УРРРРРРРРРАААААААА')
        logger.info(msg.channel)
        if (msg.channel === "operator_assigned" && msg.payload) {
            try {
                const record: SurveyActive = JSON.parse(msg.payload);
                await processRecord(bot,record);
            } catch (error) {
                logger.error("Ошибка при обработке уведомления:", error);
            }
        }
    });

    pgNotifyClient.on("error", (error) => {
        logger.error("Ошибка клиента уведомлений:", error);
        void reconnectNotifyClient(bot);
    });
}
// Переподключение при потере соединения
async function reconnectNotifyClient(bot: Bot<MyContext>): Promise<void> {
    logger.info("Соединение с PostgreSQL (уведомления) закрыто. Пытаемся переподключиться...");
    try {
        await connectPgClient(pgNotifyClient, "клиент уведомлений");
        await subscribeToNotifications();
        await checkMissedRecords(bot);
    } catch (err) {
        logger.error("Ошибка переподключения клиента уведомлений:", err);
        setTimeout(reconnectNotifyClient, 5000); // Повтор через 5 секунд
    }
}

export async function  subscribeOperatorAssigned(bot: Bot<MyContext>): Promise<void>{
    try {
        // Подключение клиентов
        await connectPgClient(pgClient, "основной клиент");

        await connectPgClient(pgNotifyClient, "клиент уведомлений");
        // Подписка на уведомления
        await subscribeToNotifications();

        // Обработка уведомлений
        handleNotifications(bot);

        // Проверка пропущенных записей
        await checkMissedRecords(bot);
    } catch (err) {
        logger.error("Ошибка инициализации:", err);
        process.exit(1);
    }
}
