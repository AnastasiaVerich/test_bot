import {db} from "../dbClient";
import {QueryResult} from "pg";

type SurveyTaskType = 'live' | 'photo' | 'video';

interface SurveyTask {
    task_id: number;
    survey_id: number;
    description: string;
    price: number;  // Сумма за задание
    task_type: SurveyTaskType;
    created_at: string;  // Дата и время в ISO формате
}
type SurveyType = 'animals' | 'city';
type SurveyStatus = 'reserved' | 'available' | 'in_progress';

interface Survey {
    survey_id: number;
    region_id: number;
    survey_type: SurveyType;
    topic: string;
    status: SurveyStatus;
    reserved_until: string | null;  // Дата и время в ISO формате
    created_at: string;  // Дата и время в ISO формате
    updated_at: string;  // Дата и время в ISO формате
}

//Функция для нахождения недавних типов опросов
export const getRecentSurveyTypesForUser = async (userId: number, querySimilarTopicDays: number): Promise<SurveyType[]> => {
    try {
        const query = `
            SELECT DISTINCT s.survey_type
            FROM user_survey_tasks ust
            JOIN surveys s ON ust.survey_id = s.survey_id
            WHERE ust.user_id = $1 AND ust.started_at >= NOW() - $2 * INTERVAL '1 day'
        `;
        const result: QueryResult<{ survey_type: SurveyType }> = await db.query(query, [userId, querySimilarTopicDays]);
        return result.rows?.map(row => row.survey_type)??[];
    } catch (error) {
        console.error("Error getRecentSurveyTypesForUser:", error);
        throw new Error("Error getRecentSurveyTypesForUser");
    }
};

//метод сброса истекших брони при запросах к серверу
export const checkAndUpdateSurveyStatus = async (): Promise<{ success: boolean }> => {
    try {
        const query = `
            UPDATE surveys
            SET status = 'available'
            WHERE status = 'reserved' AND reserved_until <= NOW();`;
        const result = await db.query(query);
        if (result.rowCount === 0) {
            return {success: false};
        }
        return {success: true};
    } catch (error) {
        console.error("Error resetting reserved surveys:", error);
        throw new Error("Failed to reset survey statuses");
    }
};

export const findAvailableSurvey = async (
    userId: number,
    regionId: number,
    recentSurveyTypes: string[]
): Promise<Survey | null> => {
    try {
        let query = `
            SELECT s.*
            FROM surveys s
            LEFT JOIN user_survey_tasks ust
                ON s.survey_id = ust.survey_id
                AND ust.user_id = $1
            WHERE s.region_id = $2
                AND s.status = 'available'
        `;
        if (recentSurveyTypes.length > 0) {
            const formattedRecentSurveyTypes = recentSurveyTypes.map((type) => `'${type}'`).join(", ");
            query += ` AND s.survey_type NOT IN (${formattedRecentSurveyTypes})`; //Исключаем темы, которые уже прошел пользователь
        }

        query += ` AND ust.survey_id IS NULL`; //Проверяем, что пользователь еще не проходил этот опрос
        // Конвертируем массив тем в строку для IN-условия

        const result: QueryResult<Survey> = await db.query(query, [userId, regionId]);

        // Если найден хотя бы один опрос, возвращаем его
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error finding available survey:', error);
        throw new Error('Error finding available survey');
    }
};
