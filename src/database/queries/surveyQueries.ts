import { QueryResult } from "pg";
import { db } from "../dbClient";
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
  tg_account: string;
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
export interface SurveyTasks  {
  survey_task_id: number;
  survey_id: number;
  description: string;
  data: string; // Данные в формате JSONB

  created_at: string; // Дата и время в ISO формате
}

//Поиск свободного опроса
export const getAvailableSurveyForRegion = async (
    regionId: number
): Promise<{ surveyId: number } | null> => {
  try {
    const query = `
      SELECT survey_id
      FROM surveys
      WHERE region_id = $1
      AND completion_limit - active_and_completed_count > 0
      LIMIT 1;
    `;

    const result = await db.query(query, [regionId]);

    if (result.rows.length === 0) {
      return null;
    }

    return {
      surveyId: result.rows[0].survey_id
    };
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getAvailableSurveyForRegion: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error isUserInSurveyActive: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error isOperatorInSurveyActive: " + shortError);
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

    const result:QueryResult<SurveyActive> = await db.query(query, [message_id]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error isOperatorInSurveyActive: " + shortError);
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

    const result:QueryResult<SurveyActive> = await db.query(query, [user_id]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getActiveSurveyByUserId: " + shortError);
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

    const result:QueryResult<SurveyActive> = await db.query(query, [operator_id]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getActiveSurveyByUserId: " + shortError);
  }
};

export const updateActiveSurveyMessageID = async (
    message_id: number,
    survey_active_id: number
): Promise<SurveyActive | undefined> => {
  try {
    const query =
        `UPDATE survey_active SET message_id = $1 WHERE survey_active_id = $2`;

    const result:QueryResult<SurveyActive> = await db.query(query, [message_id,survey_active_id]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateActiveSurveyMessageID: " + shortError);
  }
};

export const updateActiveSurveyOperatorId= async (
    operator_id: number,
    survey_active_id: number,
    reservation_time_min: string,
): Promise<SurveyActive | undefined> => {
  try {
    const query =
        `UPDATE survey_active SET operator_id = $1, reservation_end = (CURRENT_TIMESTAMP +INTERVAL '1 minute' * $3)  WHERE survey_active_id = $2`;

    const result:QueryResult<SurveyActive> = await db.query(query, [operator_id,survey_active_id,reservation_time_min]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateActiveSurveyOperatorId: " + shortError);
  }
};

export const updateActiveSurveyReservationEnd= async (
    survey_active_id: number,

): Promise<SurveyActive | undefined> => {
  try {
    const query =
        `UPDATE survey_active SET reservation_end = NULL  WHERE survey_active_id = $1`;

    const result:QueryResult<SurveyActive> = await db.query(query, [survey_active_id]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateActiveSurveyReservationEnd: " + shortError);
  }
};
export const updateActiveSurveyIsJoinedToChat= async (
    is_user_notified: boolean,
    survey_active_id: number,
): Promise<SurveyActive | undefined> => {
  try {
    const query =
        `UPDATE survey_active SET is_user_notified = $1 WHERE survey_active_id = $2`;

    const result:QueryResult<SurveyActive> = await db.query(query, [is_user_notified,survey_active_id]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateActiveSurveyIsJoinedToChat: " + shortError);
  }
};




//Добавление "резервации" и в целом пока опрос в промежуточнм состоянии он тут
export const addSurveyInActive = async (
    surveyId: number,
    userId: number,
    tg_account:string
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
      INSERT INTO survey_active (survey_id, user_id, operator_id, tg_account)
      VALUES ($1, $2, NULL, $3);
    `;
    await client.query(insertQuery, [surveyId, userId, tg_account]);
    logger.info('3333')

    await client.query('COMMIT'); // Завершаем транзакцию
  } catch (error) {
    await client.query('ROLLBACK'); // Откатываем при ошибке
    logger.info(error);
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error addSurveyInActive: " + shortError);
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
    const { survey_id, user_id, operator_id } = deleteResult.rows[0];


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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error addSurveyInActive: " + shortError);
  } finally {
    client.release(); // Освобождаем клиента
  }
};

//В БУДУЩЕМ ДОБАВИТЬ РЕЗЕРВАЦИЯ ДО АТАКОГО_ТО ЧИСЛА
//Опрос выполнен, тут мы его переносим в выполненные, удаляем из прогресс и зачисляем баланс
export const completeSurvey = async (
    surveyActiveId: number,
    result:{
      survey_task_id: number;
      isCompleted:boolean,
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
    const { survey_id, user_id, operator_id } = deleteResult.rows[0];

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
      if(item.isCompleted){
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
    if(!survey) throw new Error('странно')
    const region = await getRegionById(survey.region_id)
    if(!region) throw new Error('странно')

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
    const { survey_id } = deleteResult.rows[0];

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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error abortSurvey: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getSurveyAccrualHistory: " + shortError);
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
export const getSurveyActiveInfo = async (survey_active_id: number): Promise<SurveyActiveJoin|undefined> => {
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getSurveyActiveInfo: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getSurveyInformations: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getSurveyById: " + shortError);
  }
};
