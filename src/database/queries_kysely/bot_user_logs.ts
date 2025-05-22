import { BotUserLogsType } from "../db-types";
import { pool, poolType } from "../dbClient";
import logger from "../../lib/logger";

type EventLogType =
  | "start"
  | "restart"
  | "help"
  | "registration"
  | "survey"
  | "withdrawal";

type StepType =
  | "start"
  | "photo"
  | "phone"
  | "failed"
  | "success"
  | "check_can_take"
  | "location"
  | "search"
  | "check_balance"
  | "amount"
  | "wallet"
  | "cancel"
  | null;

export async function addUserLogs(
  params: {
    user_id: BotUserLogsType["user_id"];
    event_type: EventLogType;
    step?: StepType;
    event_data?: BotUserLogsType["event_data"];
  },
  trx: poolType = pool,
): Promise<BotUserLogsType["id"] | null> {
  try {
    const { user_id, event_type, event_data = "{}", step = null } = params;
    const result = await trx
      .insertInto("bot_user_logs")
      .values({
        user_id: user_id,
        event_type: event_type,
        event_data: event_data,
        step: step,
      })
      .returning("id")
      .executeTakeFirst();

    return result?.id ?? null;
  } catch (error) {
    logger.error("Error addUserLogs: " + error);
    return null;
  }
}

export async function addUserLogsUnique(
  params: {
    user_id: BotUserLogsType["user_id"];
    event_type: EventLogType;
    step?: StepType;
    event_data?: BotUserLogsType["event_data"];
  },
  trx: poolType = pool,
): Promise<BotUserLogsType["id"] | null> {
  try {
    const { user_id, event_type, event_data = "", step = null } = params;

    // Проверяем, существует ли запись с таким user_id и event_type
    const existing = await trx
      .selectFrom("bot_user_logs")
      .select("id")
      .where("user_id", "=", user_id)
      .where("event_type", "=", event_type)
      .executeTakeFirst();

    // Если запись существует, возвращаем null
    if (existing) {
      return null;
    }

    // Вставляем новую запись
    const result = await trx
      .insertInto("bot_user_logs")
      .values({
        user_id: user_id,
        event_type: event_type,
        event_data: event_data,
        step: null,
      })
      .returning("id")
      .executeTakeFirst();

    return result?.id ?? null;
  } catch (error) {
    throw new Error("Error addUserLogsUnique: " + error);
  }
}

export async function getAllUserLogsByEvent(
  params: {
    user_id: BotUserLogsType["user_id"];
    event_type: EventLogType;
  },
  trx: poolType = pool,
): Promise<BotUserLogsType[]> {
  try {
    const { user_id, event_type } = params;

    const logs = await trx
      .selectFrom("bot_user_logs")
      .selectAll()
      .where("user_id", "=", user_id)
      .where("event_type", "=", event_type)
      .orderBy("logged_at", "desc") // Сортировка по времени, последние логи первыми
      .execute();

    return logs;
  } catch (error) {
    throw new Error(`Error getUserStartLogs: ${error}`);
  }
}
