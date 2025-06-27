import { taskCompletedOrNotStep } from "./task_is_completed_or_not";
import { BUTTONS_KEYBOARD } from "../../constants/buttons";
import { taskResultStep } from "./task_result_step";
import { taskResultPositionsStep } from "./task_result_positions";
import { SurveyTasksType } from "../../../database/db-types";
import { MyConversation, MyConversationContext } from "../../types/type";

export interface TaskResult {
  survey_task_id: number; // ID задачи опроса
  isCompleted: boolean; // Выполнена ли задача
  result: string | null; // Основной результат (например, номер ответа)
  result_positions: string | null; // Дополнительные позиции (например, "1, 2, 3")
  reward_user: number; // Награда для пользователя
  reward_operator: number; // Награда для оператора
}

export async function tasks_result(
  conversation: MyConversation,
  ctx: MyConversationContext,
  survey_tasks: SurveyTasksType[],
  task_price: number,
): Promise<TaskResult[]> {
  const result: TaskResult[] = [];
  for (const survey_task of survey_tasks) {
    const index = survey_tasks.indexOf(survey_task);
    const isCompleted = await taskCompletedOrNotStep(
      conversation,
      ctx,
      survey_task,
    );
    if (isCompleted === null) {
      throw new Error("isCompleted error");
    }
    if (isCompleted === BUTTONS_KEYBOARD.YesButton) {
      const result_position = await taskResultStep(conversation, ctx);
      if (result_position === null) {
        throw new Error("result_position error");
      }

      const result_positions = await taskResultPositionsStep(
        conversation,
        ctx,
        survey_task.data,
      );
      if (!result_positions) {
        throw new Error("result_positions error");
      }
      result[index] = {
        survey_task_id: survey_task.survey_task_id,
        isCompleted: true,
        result: result_position,
        result_positions: result_positions.join(", "),
        reward_user: task_price,
        reward_operator: task_price / 2,
      };
    } else {
      result[index] = {
        survey_task_id: survey_task.survey_task_id,
        isCompleted: false,
        result: null,
        result_positions: null,
        reward_user: 0,
        reward_operator: 0,
      };
    }
  }
  return result;
}
