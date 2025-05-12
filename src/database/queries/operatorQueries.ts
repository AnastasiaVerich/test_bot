import {QueryResult} from "pg";
import {db} from "../dbClient";

export interface Operator {
    id: number;
    operator_id: number;
    tg_account: string;
    phone: string | null;
    can_take_multiple_surveys: boolean;

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

        throw new Error("Error findOperatorByTelegramId: " + error);
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
        throw new Error("Error registerOperator: " + error);
    }
}

export const addAllowedOperator = async (
    tg_account: string,
): Promise<Operator | undefined> => {

    try {
        const query = `INSERT INTO operators (tg_account) VALUES ($1);`;
        const result: QueryResult<Operator> = await db.query(query, [
            tg_account,
        ]);
        return result.rows[0];
    } catch (error) {

        throw new Error("Error addAllowedOperator: " + error);
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

        throw new Error("Error findAllowedOperator: " + error);
    }
};

