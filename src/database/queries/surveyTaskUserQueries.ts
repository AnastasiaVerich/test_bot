import { db } from "../dbClient";

type TaskStatusType = "in_progress" | "completed" | "pending";

export interface SurveyTaskUser {
  survey_task_user_id: number;
  user_id: bigint;
  survey_id: number;
  task_id?: number | null;
  progress_percentage: number;
  status: TaskStatusType;
  started_at: string;
  completed_at: string;
}

export const addSurveyTaskUser = async (
  userId: number,
  surveyId: number,
  taskId: number,
  progress_percentage: number,
  status: TaskStatusType,
): Promise<void> => {
  try {
    const query = `
        INSERT INTO survey_task_user (
            user_id,survey_id,task_id,progress_percentage,status,started_at,completed_at
            ) VALUES (
                $1, $2, $3, $4, $5, NOW());
    `;
    await db.query(query, [
      userId,
      surveyId,
      taskId,
      progress_percentage,
      status,
    ]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error addSurveyTaskUser: " + shortError);
  }
};

export const updateSurveyTaskUser = async (
  surveyTaskUserId: number,
  progress_percentage: number,
): Promise<void> => {
  try {
    const query = `
        UPDATE survey_task_user
        SET status = 'completed',
            progress_percentage = $2,
            completed_at = NOW()
        WHERE survey_task_user_id = $1;
    `;
    await db.query(query, [surveyTaskUserId, progress_percentage]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateSurveyTaskUser: " + shortError);
  }
};
