import {QueryResult} from "pg";
import {db} from "../dbClient";
import logger from "../../lib/logger";
import {getAllRegions, getRegionById} from "./regionQueries";

type SurveyType = "test_site";


export interface Survey {
    survey_id: number;
    region_id: number;
    survey_type: SurveyType;
    topic: string;
    description: string;
    completion_limit: number;
    active_and_completed_count: number;
    task_price: number;

    created_at: string; // Дата и время в ISO формате
}

export interface SurveyActive {
    survey_active_id: number;
    survey_id: number;
    user_id: number;
    operator_id: number;
    message_id: number;
    is_user_notified: boolean;
    tg_account: string | null;
    code_word: string | null;
    user_location: string | null;
    reservation_end: string;
    is_reservation_end: boolean;

    created_at: string; // Дата и время в ISO формате
}

export interface SurveyCompletions {
    completion_id: number;
    survey_id: number;
    survey_task_id: number;
    user_id: number;
    operator_id: number;
    result_positions_var: string;
    result: string;
    reward: number;

    created_at: string; // Дата и время в ISO формате
}

export interface SurveyTasks {
    survey_task_id: number;
    survey_id: number;
    description: string;
    data: string; // Данные в формате JSONB

    created_at: string; // Дата и время в ISO формате
}

//Поиск свободного опроса
export const getAvailableSurveyForRegion = async (
    regionId: number
): Promise<number | null | undefined> => {
    try {
        const query = `
      SELECT survey_id
      FROM surveys
      WHERE region_id = $1
      AND completion_limit - active_and_completed_count > 0
      ORDER BY active_and_completed_count ASC
      LIMIT 1;
    `;

        const result = await db.query(query, [regionId]);

        if (result.rows.length === 0) {
            return null;
        }

        return  result.rows[0].survey_id;
    } catch (error) {

        throw new Error("Error getAvailableSurveyForRegion: " + error);
    }
};
export const getAvailableSurveyWithoutRegion = async (
): Promise<number | null | undefined> => {
    try {
        const query = `
      SELECT survey_id
      FROM surveys
      WHERE completion_limit - active_and_completed_count > 0
      ORDER BY active_and_completed_count ASC
      LIMIT 1;
    `;

        const result = await db.query(query, []);

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].survey_id;
    } catch (error) {

        throw new Error("Error getAvailableSurveyForRegion: " + error);
    }
};

// Проверяем юзер уже проходит опрос или нет
export const isUserInSurveyActive = async (
    userId: number
): Promise<boolean> => {
    try {
        const query = `
      SELECT EXISTS (
        SELECT 1
        FROM survey_active
        WHERE user_id = $1
      ) AS in_active;
    `;

        const result = await db.query(query, [userId]);

        return result.rows[0].in_active;
    } catch (error) {

        throw new Error("Error isUserInSurveyActive: " + error);
    }
};

// Проверяем оператор уже проходит опрос или нет
export const isOperatorInSurveyActive = async (
    operatorId: number
): Promise<boolean> => {
    try {
        const query = `
      SELECT EXISTS (
        SELECT 1
        FROM survey_active
        WHERE operatorId = $1
      ) AS in_active;
    `;

        const result = await db.query(query, [operatorId]);

        return result.rows[0].in_active;
    } catch (error) {

        throw new Error("Error isOperatorInSurveyActive: " + error);
    }
};

// Проверяем оператор уже проходит опрос или нет
export const getActiveSurveyByMessageID = async (
    message_id: number
): Promise<SurveyActive | undefined> => {
    try {
        const query = `
      SELECT *
      FROM survey_active
      WHERE message_id = $1;
    `;

        const result: QueryResult<SurveyActive> = await db.query(query, [message_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error isOperatorInSurveyActive: " + error);
    }
};

export const getActiveSurveyByUserId = async (
    user_id: number
): Promise<SurveyActive | undefined> => {
    try {
        const query = `
      SELECT *
      FROM survey_active
      WHERE user_id = $1;
    `;

        const result: QueryResult<SurveyActive> = await db.query(query, [user_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error getActiveSurveyByUserId: " + error);
    }
};

export const getActiveSurveyByOperatorId = async (
    operator_id: number
): Promise<SurveyActive | undefined> => {
    try {
        const query = `
      SELECT *
      FROM survey_active
      WHERE operator_id = $1;
    `;

        const result: QueryResult<SurveyActive> = await db.query(query, [operator_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error getActiveSurveyByUserId: " + error);
    }
};

export const getActiveSurveyBySurveyActiveId = async (
    survey_active_id: number
): Promise<SurveyActive | undefined> => {
    try {
        const query = `
      SELECT *
      FROM survey_active
      WHERE survey_active_id = $1;
    `;

        const result: QueryResult<SurveyActive> = await db.query(query, [survey_active_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error getActiveSurveyBySurveyActiveId: " + error);
    }
};

export const getNewActiveSurveysByOperatorId = async (
    operator_id: number
): Promise<SurveyActive[]> => {
    try {
        const query = `
      SELECT *
      FROM survey_active
      WHERE operator_id = $1 AND reservation_end IS NOT NULL;
    `;

        const result: QueryResult<SurveyActive> = await db.query(query, [operator_id]);

        return result.rows;
    } catch (error) {

        throw new Error("Error getNewActiveSurveysByOperatorId: " + error);
    }
};
export const getCurrentActiveSurveysByOperatorId = async (
    operator_id: number
): Promise<SurveyActive[]> => {
    try {
        const query = `
      SELECT *
      FROM survey_active
      WHERE operator_id = $1 AND reservation_end IS NULL;
    `;

        const result: QueryResult<SurveyActive> = await db.query(query, [operator_id]);

        return result.rows;
    } catch (error) {

        throw new Error("Error getCurrentActiveSurveysByOperatorId: " + error);
    }
};

export const updateActiveSurveyMessageID = async (
    message_id: number,
    survey_active_id: number
): Promise<SurveyActive | undefined> => {
    try {
        const query =
            `UPDATE survey_active SET message_id = $1 WHERE survey_active_id = $2`;

        const result: QueryResult<SurveyActive> = await db.query(query, [message_id, survey_active_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error updateActiveSurveyMessageID: " + error);
    }
};

export const updateActiveSurveyOperatorId = async (
    operator_id: number,
    survey_active_id: number,
    reservation_time_min: string,
): Promise<SurveyActive | undefined> => {
    try {
        const query =
            `UPDATE survey_active SET operator_id = $1, reservation_end = (CURRENT_TIMESTAMP +INTERVAL '1 minute' * $3)  WHERE survey_active_id = $2 AND operator_id IS NULL RETURNING *`;

        const result: QueryResult<SurveyActive> = await db.query(query, [operator_id, survey_active_id, reservation_time_min]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error updateActiveSurveyOperatorId: " + error);
    }
};

export const updateActiveSurveyReservationEnd = async (
    survey_active_id: number,
): Promise<SurveyActive | undefined> => {
    try {
        const query =
            `UPDATE survey_active SET reservation_end = NULL  WHERE survey_active_id = $1 RETURNING *`;

        const result: QueryResult<SurveyActive> = await db.query(query, [survey_active_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error updateActiveSurveyReservationEnd: " + error);
    }
};
export const updateActiveSurveyIsJoinedToChat = async (
    is_user_notified: boolean,
    survey_active_id: number,
): Promise<SurveyActive | undefined> => {
    try {
        const query =
            `UPDATE survey_active SET is_user_notified = $1 WHERE survey_active_id = $2`;

        const result: QueryResult<SurveyActive> = await db.query(query, [is_user_notified, survey_active_id]);

        return result.rows[0];
    } catch (error) {

        throw new Error("Error updateActiveSurveyIsJoinedToChat: " + error);
    }
};


//Добавление "резервации" и в целом пока опрос в промежуточнм состоянии он тут
export const addSurveyInActive = async (
    surveyId: number,
    userId: number,
    tg_account: string | null,
    code_word: string | null,
    location_string: string
): Promise<void> => {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию
        logger.info('1111')
        const updateQuery = `
      UPDATE surveys
      SET active_and_completed_count = active_and_completed_count + 1
      WHERE survey_id = $1;
    `;
        await client.query(updateQuery, [surveyId]);
        logger.info('22222')

        const insertQuery = `
      INSERT INTO survey_active (survey_id, user_id, operator_id, tg_account,code_word, user_location)
      VALUES ($1, $2, NULL, $3, $4, $5);
    `;
        await client.query(insertQuery, [surveyId, userId, tg_account, code_word, location_string]);
        logger.info('3333')

        await client.query('COMMIT'); // Завершаем транзакцию
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        logger.info(error);

        throw new Error("Error addSurveyInActive: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
};

export const deleteSurveyInActive = async (
    surveyActiveId: number,
): Promise<void> => {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        // Удаляем из survey_active и получаем данные
        const deleteQuery = `
      DELETE FROM survey_active
      WHERE survey_active_id = $1
      RETURNING survey_id, user_id, operator_id;
    `;
        const deleteResult = await client.query(deleteQuery, [surveyActiveId]);
        const {survey_id, user_id, operator_id} = deleteResult.rows[0];


        const updateQuery = `
      UPDATE surveys
      SET active_and_completed_count = active_and_completed_count - 1
      WHERE survey_id = $1;
    `;
        await client.query(updateQuery, [survey_id]);


        await client.query('COMMIT'); // Завершаем транзакцию
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        logger.info(error);

        throw new Error("Error addSurveyInActive: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
};

//В БУДУЩЕМ ДОБАВИТЬ РЕЗЕРВАЦИЯ ДО АТАКОГО_ТО ЧИСЛА
//Опрос выполнен, тут мы его переносим в выполненные, удаляем из прогресс и зачисляем баланс
export const completeSurvey = async (
    surveyActiveId: number,
    result: {
        survey_task_id: number;
        isCompleted: boolean,
        result?: string,
        result_positions?: string,
    }[],
): Promise<void> => {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        // Удаляем из survey_active и получаем данные
        const deleteQuery = `
      DELETE FROM survey_active
      WHERE survey_active_id = $1
      RETURNING survey_id, user_id, operator_id;
    `;
        const deleteResult = await client.query(deleteQuery, [surveyActiveId]);
        if (deleteResult.rowCount === 0) {
            throw new Error('Survey active record not found');
        }
        const {survey_id, user_id, operator_id} = deleteResult.rows[0];

        // Добавляем запись в survey_completions
        const insertQuery = `
      INSERT INTO survey_completions (
        survey_id, survey_task_id, user_id, operator_id, reward, result, result_positions_var
      )
      SELECT 
        $1 AS survey_id,
        $2 AS survey_task_id,
        $3 AS user_id,
        $4 AS operator_id,        
        s.task_price AS reward,
        $5 AS result, 
        $6 AS result_positions_var
      FROM surveys s
      WHERE s.survey_id = $1
      RETURNING user_id, reward;
    `;
        let reward = 0
        for (const item of result) {
            if (item.isCompleted) {
                const insertResult = await client.query(insertQuery, [
                    1,
                    item.survey_task_id,
                    user_id,
                    operator_id,
                    item.result?.toString(),
                    item.result_positions,
                ]);
                reward += Number(insertResult.rows[0].reward)
            }

        }

        const survey = await getSurveyById(survey_id)
        if (!survey) throw new Error('странно')
        const region = await getRegionById(survey.region_id)
        if (!region) throw new Error('странно')

        // Обновляем баланс пользователя за прохождение опроса
        const updateBalanceQuery = `
      UPDATE users
      SET balance = balance + $1,
      notify_reason = 'finish_survey',
      survey_lock_until = (CURRENT_TIMESTAMP + $3)
      WHERE user_id = $2;
    `;

        await client.query(updateBalanceQuery, [reward, user_id, region.survey_interval]);

        // Проверяем referral_bonuses и обновляем статус + начисляем бонус
        const referralQuery = `
      WITH updated_referral AS (
        UPDATE referral_bonuses
        SET status = 'completed',
            amount = 100,
            completed_at = NOW()
        WHERE referred_user_id = $1
        AND status = 'pending'
        RETURNING referrer_id
      )
      UPDATE users
      SET balance = balance + 100.00
      FROM updated_referral ur
      WHERE users.user_id = ur.referrer_id
      AND ur.referrer_id IS NOT NULL;
    `;
        await client.query(referralQuery, [user_id]);

        await client.query('COMMIT'); // Завершаем транзакцию
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        logger.info(error);
        throw new Error("Error completeSurvey: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
};

export const abortSurvey = async (
    surveyActiveId: number
): Promise<void> => {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        // Удаляем из survey_active и получаем survey_id
        const deleteQuery = `
      DELETE FROM survey_active
      WHERE survey_active_id = $1
      RETURNING survey_id;
    `;
        const deleteResult = await client.query(deleteQuery, [surveyActiveId]);
        if (deleteResult.rowCount === 0) {
            throw new Error('Survey active record not found');
        }
        const {survey_id} = deleteResult.rows[0];

        // Уменьшаем active_and_completed_count
        const updateQuery = `
      UPDATE surveys
      SET active_and_completed_count = active_and_completed_count - 1
      WHERE survey_id = $1
      AND active_and_completed_count > 0;
    `;
        await client.query(updateQuery, [survey_id]);

        await client.query('COMMIT'); // Завершаем транзакцию
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        logger.info(error);

        throw new Error("Error abortSurvey: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
};

export const getSurveyAccrualHistory = async (userId: number): Promise<any[]> => {
    try {
        const query = `
      SELECT 
        completed_at AS accrual_date,
        reward AS amount,
        survey_id AS survey_id
      FROM survey_completions
      WHERE user_id = $1
      ORDER BY completed_at DESC;
    `;
        const result = await db.query(query, [userId]);
        return result.rows;
    } catch (error) {
        logger.info(error);

        throw new Error("Error getSurveyAccrualHistory: " + error);
    }
};

interface SurveyActiveJoin {
    survey_type: SurveyType;
    topic: string;
    description: string;
    task_price: number;
    region_name: string;
    reservation_time_min: string;
}

export const getSurveyActiveInfo = async (survey_active_id: number): Promise<SurveyActiveJoin | undefined> => {
    try {
        const query = `
      SELECT 
    s.survey_type,
    s.topic,
    s.description,
    s.task_price,
    rs.region_name,
    rs.reservation_time_min
FROM 
    survey_active sa
    JOIN surveys s ON sa.survey_id = s.survey_id
    JOIN region_settings rs ON s.region_id = rs.region_id
WHERE 
    sa.survey_active_id = $1;
    `;
        const result = await db.query(query, [survey_active_id]);
        return result.rows[0];
    } catch (error) {
        logger.info(error);

        throw new Error("Error getSurveyActiveInfo: " + error);
    }
};
export const getSurveyTasks = async (survey_id: number): Promise<SurveyTasks[]> => {
    try {
        const query = `
     SELECT 
    *
FROM 
    survey_tasks
WHERE 
    survey_id = $1;
    `;
        const result = await db.query(query, [survey_id]);
        return result.rows;
    } catch (error) {
        logger.info(error);

        throw new Error("Error getSurveyInformations: " + error);
    }
};
export const getSurveyById = async (survey_id: number): Promise<Survey | undefined> => {
    try {
        const query = `
     SELECT 
    *
FROM 
    surveys
WHERE 
    survey_id = $1;
    `;
        const result = await db.query(query, [survey_id]);
        return result.rows[0];
    } catch (error) {
        logger.info(error);

        throw new Error("Error getSurveyById: " + error);
    }
};


export const addSurvey = async (
    region_id: number,
    survey_type: SurveyType,
    topic: string,
    description: string,
    completion_limit: number,
    active_and_completed_count: number,
    task_price: number,
    tasks:{
        description: string;
        data: string;
    }[]
): Promise<number | null> => {
    const client = await db.connect(); // Получаем клиента для транзакции

    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        const queryInsertSurvey = 'INSERT INTO surveys' +
            ' (region_id, survey_type, topic, description, completion_limit, active_and_completed_count, task_price)' +
            ' VALUES ($1,$2,$3,$4,$5,$6,$7)' +
            ' RETURNING survey_id;';
        const resultInsertSurvey:QueryResult<Survey> = await db.query(queryInsertSurvey,
            [region_id, survey_type, topic, description, completion_limit, active_and_completed_count, task_price]);

        if (resultInsertSurvey.rowCount === 0) {
            throw new Error('Survey insert failed');
        }

        const {survey_id} = resultInsertSurvey.rows[0];

        const queryInsertSurveyTask = 'INSERT INTO survey_tasks ' +
            ' (survey_id, description, data)' +
            ' VALUES ($1, $2, $3)' +
            ' RETURNING survey_task_id;';

        for (const task of tasks) {
            const insertTask = await client.query(queryInsertSurveyTask, [
                survey_id,
                task.description,
                task.data
                ]);
            if (insertTask.rowCount === 0) {
                throw new Error('Survey task insert failed');
            }
        }
        await client.query('COMMIT'); // Завершаем транзакцию

        return survey_id

    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        logger.error("Error addSurvey: " + error)
        return null

    } finally {
        client.release(); // Освобождаем клиента
    }
};
