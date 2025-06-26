import { pool } from "../dbClient";
import {
  deleteAuditActiveSurvey,
  setAuditActiveSurveyAuditorIdIfNull,
} from "../queries_kysely/audit_survey_active";
import { addAuditSurveyTaskCompletions } from "../queries_kysely/audit_survey_task_completions";
import { AuditorSurveyActiveType } from "../db-types";
import { updateSurveyCompletion } from "../queries_kysely/survey_task_completions";
import { updateUserByUserId } from "../queries_kysely/users";
import { updateOperatorByOperatorId } from "../queries_kysely/operators";
import { addRecheckSurvey } from "../queries_kysely/recheck_survey";
import { TaskResult } from "../../bot-auditor/scenes/common_step/tasks_result";

export async function auditorCompletedAuditSurvey(
  params: {
    delete_id: number;
    user_id: number;
    survey_id: number;
    operator_id: number;
    video_id: number;
    auditor_id: number;
  },
  result: Array<
    TaskResult & {
      completion_id: number | null;
      isSameAnswers: boolean;
    }
  >,
): Promise<any> {
  try {
    const { delete_id, user_id, survey_id, operator_id, video_id, auditor_id } =
      params;

    return await pool.transaction().execute(async (trx) => {
      // сошлись ответы или нет
      const isAllSameAnswer =
        result.filter((el) => !el.isSameAnswers).length === 0;

      // удаление активной записи для аудитора
      const isDeleteAuditActiveSurveyId = await deleteAuditActiveSurvey(
        delete_id,
        trx,
      );
      if (!isDeleteAuditActiveSurveyId) {
        throw new Error("deleteAuditActiveSurvey failed");
      }

      let reward_user = 0;
      let reward_operator = 0;
      let audit_task_ids = [];
      // Добавление ответов на задания опросов
      for (const item of result) {
        const auditCompletedTaskId = await addAuditSurveyTaskCompletions(
          {
            completion_id: item.completion_id,
            auditor_id: auditor_id,
            result: item.result,
            result_positions_var: item.result_positions,
            survey_task_id: item.survey_task_id,
            survey_id: survey_id,
            reward_auditor: 0,
            description: "",
          },
          trx,
        );
        if (!auditCompletedTaskId) {
          throw new Error("addAuditSurveyTaskCompletions failed");
        }

        // если все ок, то считаем ответы оператора валидными, обновляем награду за задание.
        if (item.completion_id && isAllSameAnswer) {
          const updateCompletedTaskId = await updateSurveyCompletion(
            item.completion_id,
            {
              reward_user: item.reward_user,
              reward_operator: item.reward_operator,
              is_valid: true,
            },
            trx,
          );
          if (!updateCompletedTaskId) {
            throw new Error("updateSurveyCompletion failed");
          }
          reward_user += Number(item.reward_user);
          reward_operator += Number(item.reward_operator);
        }
        audit_task_ids.push(auditCompletedTaskId);
      }

      // Если нужна перепроверка, то добавляем соответствующую запись.
      if (!isAllSameAnswer) {
        const isAddRecheckSurveyId = await addRecheckSurvey(
          {
            user_id: user_id,
            survey_id: survey_id,
            operator_id: operator_id,
            video_id: video_id,
            audit_task_ids: audit_task_ids,
          },
          trx,
        );
        if (!isAddRecheckSurveyId) {
          throw new Error("addRecheckSurvey failed");
        }
      }

      const isUserBalanceUpdate = await updateUserByUserId(
        user_id,
        {
          add_balance: reward_user,
        },
        trx,
      );

      if (!isUserBalanceUpdate) {
        throw new Error("updateUserByUserId filed");
      }
      const isOperatorBalanceUpdate = await updateOperatorByOperatorId(
        operator_id,
        {
          add_balance: reward_operator,
        },
        trx,
      );

      if (!isOperatorBalanceUpdate) {
        throw new Error("updateOperatorByOperatorId filed");
      }
    });
  } catch (error) {
    throw new Error("Error auditorCompletedAuditSurvey: " + error);
  }
}

export async function reservationAuditSurveyActiveByAuditor(params: {
  auditor_id: AuditorSurveyActiveType["auditor_id"];
  audit_survey_active_id: AuditorSurveyActiveType["audit_survey_active_id"];
}): Promise<"ok" | undefined> {
  try {
    const { auditor_id, audit_survey_active_id } = params;
    return await pool.transaction().execute(async (trx) => {
      const auditActiveSurvey = setAuditActiveSurveyAuditorIdIfNull(
        audit_survey_active_id,
        auditor_id,
        trx,
      );
      if (!auditActiveSurvey) return;

      return "ok";
    });
  } catch (error) {
    throw new Error("Error reservationAuditSurveyActiveByAuditor: " + error);
  }
}
