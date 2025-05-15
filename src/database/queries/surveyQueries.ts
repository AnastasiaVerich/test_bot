import {QueryResult} from "pg";
import {db} from "../dbClient";
import logger from "../../lib/logger";
import {getRegionById} from "../queries_kysely/region_settings";
import {getSurveyById} from "../queries_kysely/surveys";

type SurveyType = "test_site";

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


export interface SurveyTasks {
    survey_task_id: number;
    survey_id: number;
    description: string;
    data: string; // Данные в формате JSONB

    created_at: string; // Дата и время в ISO формате
}

interface SurveyActiveJoin {
    survey_type: SurveyType;
    topic: string;
    description: string;
    task_price: number;
    region_name: string;
    reservation_time_min: string;
}

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
                    survey_id,
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


