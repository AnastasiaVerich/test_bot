import { pool, poolType } from "../dbClient";
import { AuditorSurveyActiveType } from "../db-types";

export async function addAuditSurveyActive(
  params: {
    survey_id: AuditorSurveyActiveType["survey_id"];
    operator_id: AuditorSurveyActiveType["operator_id"];
    user_id: AuditorSurveyActiveType["user_id"];
    video_id: AuditorSurveyActiveType["video_id"];
    task_completions_ids: AuditorSurveyActiveType["task_completions_ids"];
    auditor_id?: AuditorSurveyActiveType["auditor_id"];
  },
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["audit_survey_active_id"] | null> {
  try {
    const {
      task_completions_ids,
      survey_id,
      auditor_id = null,
      operator_id,
      user_id,
      video_id,
    } = params;

    const result = await trx
      .insertInto("audit_survey_active")
      .values({
        task_completions_ids: task_completions_ids,
        survey_id: survey_id,
        auditor_id: auditor_id,
        video_id: video_id,
        operator_id: operator_id,
        user_id: user_id,
        message_id: null,
      })
      .returning("audit_survey_active_id")
      .executeTakeFirst();

    return result?.audit_survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error addAuditSurveyActive: " + error);
  }
}

export async function getAuditSurveyActiveByAuditorId(
  auditor_id: AuditorSurveyActiveType["auditor_id"],
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType | null> {
  try {
    const result = await trx
      .selectFrom("audit_survey_active")
      .selectAll()
      .where("auditor_id", "=", auditor_id)
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getAuditSurveyActiveByAuditorId: " + error);
  }
}

export async function getAuditSurveyActiveByMessageId(
  message_id: AuditorSurveyActiveType["message_id"],
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType | null> {
  try {
    const result = await trx
      .selectFrom("audit_survey_active")
      .selectAll()
      .where("message_id", "=", message_id)
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getAuditSurveyActiveByMessageId: " + error);
  }
}

export async function deleteAuditActiveSurvey(
  audit_survey_active_id: AuditorSurveyActiveType["audit_survey_active_id"],
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["audit_survey_active_id"] | null> {
  try {
    const result = await trx
      .deleteFrom("audit_survey_active")
      .where("audit_survey_active_id", "=", audit_survey_active_id)
      .returning("audit_survey_active_id")
      .executeTakeFirst();

    return result?.audit_survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error deleteAuditActiveSurvey: " + error);
  }
}

export async function updateAuditActiveSurvey(
  audit_survey_active_id: AuditorSurveyActiveType["audit_survey_active_id"],
  params: {
    messageId?: AuditorSurveyActiveType["message_id"];
    auditor_id?: AuditorSurveyActiveType["auditor_id"];
  },
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["audit_survey_active_id"] | null> {
  try {
    const { messageId, auditor_id } = params;

    if (messageId === undefined && auditor_id === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} )  must be provided.`,
      );
    }

    const set: Partial<AuditorSurveyActiveType> = {};

    if (messageId !== undefined) {
      set.message_id = messageId;
    }

    if (auditor_id !== undefined) {
      set.auditor_id = auditor_id;
    }

    const result = await trx
      .updateTable("audit_survey_active")
      .set(set)
      .where("audit_survey_active_id", "=", audit_survey_active_id)
      .returning("audit_survey_active_id")
      .executeTakeFirst();

    return result?.audit_survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error updateAuditActiveSurvey: " + error);
  }
}

export async function setAuditActiveSurveyAuditorIdIfNull(
  audit_survey_active_id: AuditorSurveyActiveType["audit_survey_active_id"],
  auditor_id: AuditorSurveyActiveType["auditor_id"],
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["audit_survey_active_id"] | null> {
  try {
    const result = await trx
      .updateTable("audit_survey_active")
      .set({ auditor_id: auditor_id })
      .where("audit_survey_active_id", "=", audit_survey_active_id)
      .where("auditor_id", "is", null)
      .returning("audit_survey_active_id")
      .executeTakeFirst();
    return result?.audit_survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error setAuditActiveSurveyAuditorIdIfNull: " + error);
  }
}
