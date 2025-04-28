import {QueryResult} from "pg";
import {db} from "../dbClient";

export interface Operator {
    id: number;
    operator_id: number;
    tg_account: string;
    phone: string | null;
    telegram_chat_id: number;

    created_at: string; // Дата и время в ISO формате
}

export interface OperatorRegions {
    operator_region_id: number;
    operator_id: number;
    region_id: number;

    created_at: string; // Дата и время в ISO формате
}

export interface AllowedOperators {
    id: number;
    tg_account: string;

    created_at: string; // Дата и время в ISO формате
}

export const findOperator = async (
    operator_id: number | null,
    phone: string | null,
    tg_account: string | null,
): Promise<Operator | undefined> => {
    // Проверка, что хотя бы одно из значений передано
    if (!operator_id && !phone && !tg_account) {
        throw new Error(
            "At least one of accountId or phoneNumber must be provided.",
        );
    }

    try {
        const query = `
           SELECT * 
           FROM operators 
           WHERE operator_id = $1 OR phone = $2 OR tg_account = $3
            ;`;
        const result: QueryResult<Operator> = await db.query(query, [
            operator_id,
            phone,
            tg_account,
        ]);
        return result.rows[0];
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        throw new Error("Error findOperatorByTelegramId: " + shortError);
    }
};

export const registerOperator = async (
    operator_id: number ,
    phone: string ,
    tg_account: string,
): Promise<Operator> => {

    try {
        const query =
            `UPDATE operators SET operator_id = $1,phone = $2 WHERE tg_account = $3 RETURNING *;`;
        const result: QueryResult<Operator> = await db.query(query, [
            operator_id,
            phone,
            tg_account,
        ]);
        return result.rows[0];
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        throw new Error("Error registerOperator: " + shortError);
    }
}

export const addAllowedOperator = async (
    tg_account: string,
    telegram_chat_id: number,
): Promise<Operator | undefined> => {

    try {
        const query = `INSERT INTO operators (tg_account,telegram_chat_id) VALUES ($1, $2);`;
        const result: QueryResult<Operator> = await db.query(query, [
            tg_account,
            telegram_chat_id,
        ]);
        return result.rows[0];
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        throw new Error("Error addAllowedOperator: " + shortError);
    }
}
export const findOperatorByTgAccount = async (
    tg_account: string | null,
): Promise<Operator | undefined> => {

    try {
        const query = `
           SELECT * 
           FROM operators 
           WHERE tg_account = $1
            ;`;
        const result: QueryResult<Operator> = await db.query(query, [
            tg_account,
        ]);
        return result.rows[0];
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        throw new Error("Error findAllowedOperator: " + shortError);
    }
};

