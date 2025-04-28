import {Client} from "pg";
import {pgConfig} from "../../database/dbClient";
import {Bot} from "grammy";
import {SurveyActive, updateActiveSurveyMessageID} from "../../database/queries/surveyQueries";
import {channelId} from "../../config/env";
import {MyContext} from "../../bot-common/types/type";

const pgNotifyClient = new Client(pgConfig);
const pgClient = new Client(pgConfig);

// Подключение к PostgreSQL
async function connectPgClient(client: Client, name: string): Promise<void> {
    try {
        await client.connect();
        console.log(`Подключен ${name} к PostgreSQL`);
    } catch (err) {
        console.error(`Ошибка подключения ${name} к PostgreSQL:`, err);
        throw err;
    }
}
// Функция подписки на уведомления
async function subscribeToNotifications(): Promise<void> {
    try {
        await pgNotifyClient.query("LISTEN survey_active_insert");
        console.log("Подписка на survey_active_insert установлена");
    } catch (err) {
        console.error("Ошибка при подписке на уведомления:", err);
        throw err;
    }
}

// Задержка для повторных попыток
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Функция отправки сообщения с тремя попытками
async function sendMessageWithRetry(bot: Bot<MyContext>,message: string): Promise<number | null> {
    const maxAttempts = 3;
    let attempt = 1;
    console.log(channelId)

    while (attempt <= maxAttempts) {
        try {
            const result = await bot.api.sendMessage(channelId, message);
            console.log(`Сообщение успешно отправлено в канал, message_id: ${result.message_id}, попытка: ${attempt}`);
            return result.message_id;
        } catch (error) {
            console.warn(`Попытка ${attempt} не удалась: ${error}`);
            if (attempt === maxAttempts) {
                console.error("Не удалось отправить сообщение после всех попыток");
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
    const { survey_active_id, created_at } = record;
    const message = `Новый активный опрос!\nСоздан: ${created_at}`;

    try {
        // Отправка сообщения и получение message_id
        const messageId = await sendMessageWithRetry(bot,message);

        if (messageId !== null) {
            // Обновление message_id в таблице survey_active
            await updateActiveSurveyMessageID(messageId, survey_active_id);
            console.log(`Запись ${survey_active_id} обновлена с message_id: ${messageId}`);
        } else {
            console.error(`Не удалось обновить запись ${survey_active_id}: сообщение не отправлено`);
        }
    } catch (error) {
        console.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

// Функция проверки пропущенных записей
async function checkMissedRecords(bot: Bot<MyContext>): Promise<void> {
    try {
        const result = await pgClient.query(`
      SELECT survey_active_id, survey_id, user_id, created_at
      FROM survey_active
      WHERE operator_id IS NULL
        AND message_id IS NULL
      ORDER BY created_at ASC
    `);

        for (const record of result.rows as SurveyActive[]) {
            console.log(`Обработка пропущенной записи: ${record.survey_active_id}`);
            await processRecord(bot,record);
        }
    } catch (error) {
        console.error("Ошибка при проверке пропущенных записей:", error);
    }
}

// Обработка уведомлений
function handleNotifications(bot: Bot<MyContext>): void {
    pgNotifyClient.on("notification", async (msg) => {
        if (msg.channel === "survey_active_insert" && msg.payload) {
            try {
                const record: SurveyActive = JSON.parse(msg.payload);
                await processRecord(bot,record);
            } catch (error) {
                console.error("Ошибка при обработке уведомления:", error);
            }
        }
    });

    pgNotifyClient.on("error", (error) => {
        console.error("Ошибка клиента уведомлений:", error);
        void reconnectNotifyClient(bot);
    });
}
// Переподключение при потере соединения
async function reconnectNotifyClient(bot: Bot<MyContext>): Promise<void> {
    console.warn("Соединение с PostgreSQL (уведомления) закрыто. Пытаемся переподключиться...");
    try {
        await connectPgClient(pgNotifyClient, "клиент уведомлений");
        await subscribeToNotifications();
        await checkMissedRecords(bot);
    } catch (err) {
        console.error("Ошибка переподключения клиента уведомлений:", err);
        setTimeout(reconnectNotifyClient, 5000); // Повтор через 5 секунд
    }
}

export async function  subscribeNotify(bot: Bot<MyContext>): Promise<void>{
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
        console.error("Ошибка инициализации:", err);
        process.exit(1);
    }
}
