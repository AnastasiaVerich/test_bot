import { QueryResult } from "pg";
import { db } from "../dbClient";

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
interface SurveyTask {
  task_id: number;
  survey_id: number;
  description: string;

  created_at: string; // Дата и время в ISO формате
}
interface SurveyActive {
  survey_active_id: number;
  survey_id: number;
  user_id: number;
  operator_id: number;

  created_at: string; // Дата и время в ISO формате
}
interface SurveyCompletions {
  completion_id: number;
  survey_id: number;
  user_id: number;
  operator_id: number;
  count_completed: number;
  reward: number;

  created_at: string; // Дата и время в ISO формате
}
interface SurveyTask {
  task_id: number;
  survey_id: number;
  description: string;

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

//Добавление "резервации" и в целом пока опрос в промежуточнм состоянии он тут
export const addSurveyInActive = async (
    surveyId: number,
    userId: number,
    operatorId: number
): Promise<void> => {
  const client = await db.connect(); // Получаем клиента для транзакции
  try {
    await client.query('BEGIN'); // Начинаем транзакцию

    const updateQuery = `
      UPDATE surveys
      SET active_and_completed_count = active_and_completed_count + 1
      WHERE survey_id = $1;
    `;
    await client.query(updateQuery, [surveyId]);

    const insertQuery = `
      INSERT INTO survey_active (survey_id, user_id, operator_id)
      VALUES ($1, $2, $3);
    `;
    await client.query(insertQuery, [surveyId, userId, operatorId]);

    await client.query('COMMIT'); // Завершаем транзакцию
  } catch (error) {
    await client.query('ROLLBACK'); // Откатываем при ошибке
    console.log(error);
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
    completedTasksCount: number
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
        survey_id, user_id, operator_id, count_completed, reward
      )
      SELECT 
        $1 AS survey_id,
        $2 AS user_id,
        $3 AS operator_id,
        $4 AS count_completed,
        $4 * s.task_price AS reward
      FROM surveys s
      WHERE s.survey_id = $1
      RETURNING user_id, reward;
    `;
    const insertResult = await client.query(insertQuery, [survey_id, user_id, operator_id, completedTasksCount]);
    const { reward } = insertResult.rows[0];

    // Обновляем баланс пользователя за прохождение опроса
    const updateBalanceQuery = `
      UPDATE users
      SET balance = balance + $1
      WHERE user_id = $2;
    `;
    await client.query(updateBalanceQuery, [reward, user_id]);

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
    console.log(error);
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error completeSurvey: " + shortError);
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
    console.log(error);
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
    console.log(error);
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getSurveyAccrualHistory: " + shortError);
  }
};
