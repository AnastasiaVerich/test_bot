import {db} from "../dbClient";
import logger from "../../lib/logger";
import {QueryResult} from "pg";
import {SurveyActive} from "./surveyQueries";

type CommonVariablesLabelType = "ton_rub_price" ;

interface CommonVariables {
    common_vars_id: number;
    label : CommonVariablesLabelType ;
    value: string ;
    created_at: string; // Дата добавления
}

export const upsertCommonVariable = async (
    label: CommonVariablesLabelType,
    value: string
): Promise<void> => {
    try {
        const query = `
            INSERT INTO common_variables (label, value)
            VALUES ($1, $2)
            ON CONFLICT (label)
            DO UPDATE SET
                value = EXCLUDED.value,
                created_at = CURRENT_TIMESTAMP
        `;
        await db.query(query, [label, value]);
    } catch (error) {
        logger.info(error)
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        throw new Error("Error upsertCommonVariable: " + shortError);
    }
};

export const getCommonVariableByLabel = async (
    label: CommonVariablesLabelType,
): Promise<CommonVariables | undefined> => {
    try {
        const query = `SELECT * FROM common_variables WHERE label = $1`;
        const result:QueryResult<CommonVariables> =await db.query(query, [label]);
        return result.rows[0];

    } catch (error) {
        logger.info(error)

        throw new Error("Error getCommonVariableByLabel: " + error);
    }
};
