import { pool } from "../dbClient";
import {
  deleteAuditActiveSurvey,
  setAuditActiveSurveyAuditorIdIfNull,
} from "../queries_kysely/audit_survey_active";
import { addAuditSurveyTaskCompletions } from "../queries_kysely/audit_survey_task_completions";
import { updateAuditorByAuditorId } from "../queries_kysely/auditors";
import { AuditorSurveyActiveType } from "../db-types";

export async function auditorCompletedAuditSurvey(
  params: {
    audit_survey_active_id: number;
    auditor_id: number;
  },
  result: {
    isCompleted: boolean;
    reward_auditor: number;
    result: string | null;
    result_positions: string | null;
    description: string | null;
    completed_id: number | null;
  }[],
): Promise<any> {
  try {
    const { audit_survey_active_id, auditor_id } = params;

    return await pool.transaction().execute(async (trx) => {
      const isDeleteAuditActiveSurveyId = await deleteAuditActiveSurvey(
        audit_survey_active_id,
        trx,
      );
      if (!isDeleteAuditActiveSurveyId) {
        throw new Error("AUDIT Survey active delete failed");
      }

      let reward = 0;
      for (const item of result) {
        const auditCompletedTaskId = await addAuditSurveyTaskCompletions(
          {
            completion_id: item.completed_id,
            auditor_id: auditor_id,
            result: item.result,
            result_positions_var: item.result_positions,
            reward_auditor: item.reward_auditor,
            description: item.description,
          },
          trx,
        );
        if (!auditCompletedTaskId) {
          throw new Error("Survey Completion add failed");
        }
        reward += Number(item.reward_auditor);
      }

      const isBalanceUpdate = await updateAuditorByAuditorId(
        auditor_id,
        {
          add_balance: reward,
        },
        trx,
      );

      if (!isBalanceUpdate) {
        throw new Error("UpdateBalance filed");
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
