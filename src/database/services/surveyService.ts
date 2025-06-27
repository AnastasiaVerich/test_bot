import {
  RegionSettingsType,
  SurveyActiveType,
  SurveysType,
  UsersType,
} from "../db-types";
import { pool } from "../dbClient";
import {
  addSurveyActive,
  deleteActiveSurvey,
  isInSurveyActive,
  setActiveSurveyOperatorIdIfNull,
  updateActiveSurvey,
} from "../queries_kysely/survey_active";
import {
  addSurvey,
  getSurveyById,
  updateSurvey,
} from "../queries_kysely/surveys";
import { addSurveyTask } from "../queries_kysely/survey_tasks";
import logger from "../../lib/logger";
import { getRegionById } from "../queries_kysely/region_settings";
import {
  addSurveyCompletion,
  deleteSurveyCompletion,
  updateSurveyCompletion,
} from "../queries_kysely/survey_task_completions";
import { updateUserByUserId } from "../queries_kysely/users";
import {
  getReferralByReferredUserIdAndStatus,
  updateReferralByReferredUserId,
} from "../queries_kysely/referral_bonuses";
import { updateOperatorByOperatorId } from "../queries_kysely/operators";
import { addAuditSurveyActive } from "../queries_kysely/audit_survey_active";
import { deleteRecheckSurvey } from "../queries_kysely/recheck_survey";
import { TaskResult } from "../../bot-common/scenes/common_step/tasks_result";

export async function reservationSurveyActiveByOperator(params: {
  operatorId: SurveyActiveType["operator_id"];
  surveyActiveId: SurveyActiveType["survey_active_id"];
  reservationMinutes: RegionSettingsType["reservation_time_min"];
}): Promise<string | undefined> {
  try {
    const { operatorId, surveyActiveId, reservationMinutes } = params;

    return await pool.transaction().execute(async (trx) => {
      const activeSurvey = setActiveSurveyOperatorIdIfNull(
        surveyActiveId,
        operatorId,
        trx,
      );
      if (!activeSurvey) return;

      const resultUpdate = await updateActiveSurvey(
        surveyActiveId,
        {
          reservationMinutes: reservationMinutes,
        },
        trx,
      );
      if (!resultUpdate) {
        throw new Error("Не удалось обновить reservationMinutes");
      }

      return "ok";
    });
  } catch (error) {
    throw new Error("Error reservationSurveyActiveByOperator: " + error);
  }
}

export async function checkCanUserTakeSurvey(user: UsersType): Promise<{
  result: boolean;
  reason?: "userInSurveyActive" | "is_survey_lock";
  surveyUntil?: number | null;
}> {
  try {
    return await pool.transaction().execute(async (trx) => {
      const userInSurveyActive = await isInSurveyActive(
        {
          userId: user.user_id,
        },
        trx,
      );
      if (userInSurveyActive)
        return { result: false, reason: "userInSurveyActive" };

      const nowTimespan = Number(new Date());
      const lockUntilTimespan = user.survey_lock_until
        ? Number(new Date(user.survey_lock_until))
        : null;
      const is_survey_lock = lockUntilTimespan
        ? lockUntilTimespan > nowTimespan
        : false;
      if (is_survey_lock)
        return {
          result: false,
          reason: "is_survey_lock",
          surveyUntil: lockUntilTimespan,
        };

      return { result: true };
    });
  } catch (error) {
    throw new Error("Error checkCanUserTakeSurvey: " + error);
  }
}

export async function takeSurveyByUser(params: {
  surveyId: number;
  userId: number;
  tg_account: string | null;
  code_word: string | null;
  location_string: string;
}): Promise<void> {
  try {
    const { surveyId, userId, tg_account, code_word, location_string } = params;

    return await pool.transaction().execute(async (trx) => {
      const isUpd = await updateSurvey(surveyId, { increment_count: 1 }, trx);
      if (!isUpd) {
        throw new Error("updateSurvey не обновилась");
      }
      const isUserUpdate = await updateUserByUserId(
        userId,
        {
          last_user_location: location_string,
          last_tg_account: tg_account,
        },
        trx,
      );
      if (!isUserUpdate) {
        throw new Error("updateUserByUserId filed");
      }
      await addSurveyActive(
        {
          surveyId: surveyId,
          userId: userId,
          codeWord: code_word,
        },
        trx,
      );

      return;
    });
  } catch (error) {
    throw new Error("Error takeSurveyByUser: " + error);
  }
}

export async function cancelTakeSurveyByUser(
  surveyActiveId: SurveyActiveType["survey_active_id"],
  surveyId: SurveyActiveType["survey_id"],
): Promise<void> {
  try {
    return await pool.transaction().execute(async (trx) => {
      const isDeleteActiveSurveyId = await deleteActiveSurvey(
        surveyActiveId,
        trx,
      );
      if (!isDeleteActiveSurveyId) {
        throw new Error("Survey active delete failed");
      }

      const isUpd = await updateSurvey(surveyId, { decrement_count: 1 }, trx);
      if (!isUpd) {
        throw new Error("Survey updating failed");
      }

      return;
    });
  } catch (error) {
    throw new Error("Error cancelTakeSurveyByUser: " + error);
  }
}

export async function addNewSurveyWithTasks(params: {
  region_id: number;
  survey_type: SurveysType["survey_type"];
  topic: string;
  description: string;
  completion_limit: number;
  task_price: number;
  tasks: {
    description: string;
    data: string;
  }[];
}): Promise<string | undefined> {
  try {
    const {
      region_id,
      survey_type,
      topic,
      description,
      completion_limit,
      task_price,
      tasks,
    } = params;
    return await pool.transaction().execute(async (trx) => {
      const newSurveyId = await addSurvey(
        {
          completionLimit: completion_limit,
          description: description,
          regionId: region_id,
          surveyType: survey_type,
          taskPrice: task_price,
          topic: topic,
        },
        trx,
      );
      if (!newSurveyId) {
        throw new Error("Survey insert failed");
      }
      for (const task of tasks) {
        const insertTaskId = await addSurveyTask(
          {
            surveyId: newSurveyId,
            description: task.description,
            data: task.data,
          },
          trx,
        );
        if (!insertTaskId) {
          throw new Error("Survey task insert failed");
        }
      }
      return "ok";
    });
  } catch (error) {
    logger.error("Error addNewSurveyWithTasks: " + error);
    return;
  }
}

export async function getInfoAboutSurvey(
  surveyId: number,
): Promise<(RegionSettingsType & SurveysType) | undefined> {
  try {
    return await pool.transaction().execute(async (trx) => {
      const survey = await getSurveyById(surveyId, trx);
      if (!survey) return;

      const region = await getRegionById(survey.region_id, trx);
      if (!region) return;
      return {
        ...survey,
        ...region,
      };
    });
  } catch (error) {
    throw new Error("Error getInfoAboutSurvey: " + error);
  }
}

export async function userCompletedSurvey(
  params: {
    delete_id: number;
    user_id: number;
    survey_id: number;
    operator_id: number;
    video_id: number | null;
    survey_interval: string;
  },
  result: TaskResult[],
): Promise<any> {
  try {
    const {
      delete_id,
      user_id,
      survey_id,
      operator_id,
      survey_interval,
      video_id,
    } = params;

    return await pool.transaction().execute(async (trx) => {
      //удаление активного опроса
      const isDeleteActiveSurveyId = await deleteActiveSurvey(delete_id, trx);
      if (!isDeleteActiveSurveyId) {
        throw new Error("deleteActiveSurvey failed");
      }
      let reward_user = 0;
      let reward_operator = 0;
      const task_completions_ids: number[] = [];
      //добавление ответов на задания опроса
      for (const item of result) {
        if (
          item.isCompleted &&
          item.result !== null &&
          item.result_positions !== null
        ) {
          const completedTaskId = await addSurveyCompletion(
            {
              survey_id: survey_id,
              survey_task_id: item.survey_task_id,
              user_id: user_id,
              operator_id: operator_id,
              result_main: item.result,
              result_positions: item.result_positions,
              reward_user: !video_id ? item.reward_user : 0,
              reward_operator: !video_id ? item.reward_operator : 0,
              video_id: video_id,
            },
            trx,
          );
          if (!completedTaskId) {
            throw new Error("addSurveyCompletion failed");
          }
          task_completions_ids.push(completedTaskId);
          reward_user += Number(item.reward_user);
          reward_operator += Number(item.reward_operator);
        }
      }

      //добавление записи на проверку аудитору
      if (video_id) {
        const addAuditSurveyActiveId = await addAuditSurveyActive(
          {
            user_id: user_id,
            survey_id: survey_id,
            operator_id: operator_id,
            video_id: video_id,
            task_completions_ids: task_completions_ids,
          },
          trx,
        );
        if (!addAuditSurveyActiveId) {
          throw new Error("addAuditSurveyActive failed");
        }
      }

      // Обновляем пользователю баланс, блокируем прохождение опросов на определенное время и ставим
      // уведомление для того, что бы ему пришло сообщение, информирующее об окончании опроса
      const isUserInfoUpdate = await updateUserByUserId(
        user_id,
        {
          add_balance: !video_id ? reward_user : 0,
          notifyReason: "finish_survey",
          interval_survey_lock_until: survey_interval,
        },
        trx,
      );
      if (!isUserInfoUpdate) {
        throw new Error("updateUserByUserId filed");
      }
      const isBalanceOperatorUpdate = await updateOperatorByOperatorId(
        operator_id,
        {
          add_balance: !video_id ? reward_operator : 0,
        },
        trx,
      );
      if (!isBalanceOperatorUpdate) {
        throw new Error("updateOperatorByOperatorId filed");
      }

      const referral_data = await getReferralByReferredUserIdAndStatus(
        user_id,
        "pending",
        trx,
      );

      if (referral_data) {
        const sum_regard = 100;
        const isUpdateReferral = await updateReferralByReferredUserId(
          user_id,
          {
            status: "completed",
            amount: sum_regard,
          },
          trx,
        );
        if (!isUpdateReferral) {
          throw new Error("updateReferralByReferredUserId filed");
        }
        const isBalanceUpdate = await updateUserByUserId(
          referral_data.referrer_id,
          {
            add_balance: sum_regard,
          },
          trx,
        );
        if (!isBalanceUpdate) {
          throw new Error("updateUserByUserId 2 filed");
        }
      }
    });
  } catch (error) {
    throw new Error("Error userCompletedSurvey: " + error);
  }
}

export async function userRecheckSurvey(
  params: {
    delete_id: number;
    user_id: number;
    survey_id: number;
    operator_id: number;
    video_id: number;
  },
  result: Array<
    TaskResult & {
      completion_id: number | null;
      isSameAnswers: boolean;
    }
  >,
): Promise<any> {
  try {
    const { delete_id, user_id, survey_id, operator_id, video_id } = params;

    return await pool.transaction().execute(async (trx) => {
      // сошлись ответы или нет
      const isAllSameAnswer =
        result.filter((el) => !el.isSameAnswers).length === 0;

      // удаление активной записи на перепроверку
      const isDeleteRecheckSurveyId = await deleteRecheckSurvey(delete_id, trx);

      if (!isDeleteRecheckSurveyId) {
        throw new Error("deleteRecheckSurvey failed");
      }
      let reward_user = 0;
      let reward_operator = 0;
      const task_completions_ids: number[] = [];

      // Обновление ответов на задания опроса, либо добавление, если раньше не было такого ответа,
      // либо удаление, если случайно раньше написали, что задание выполнено было.
      for (const item of result) {
        if (
          item.isCompleted &&
          item.result !== null &&
          item.result_positions !== null
        ) {
          if (item.completion_id) {
            const updateTaskId = await updateSurveyCompletion(
              item.completion_id,
              {
                result_main: item.result,
                result_positions: item.result_positions,
                reward_user: isAllSameAnswer ? item.reward_user : 0,
                reward_operator: isAllSameAnswer ? item.reward_operator : 0,
                is_valid: isAllSameAnswer,
              },
              trx,
            );
            if (!updateTaskId) {
              throw new Error("updateSurveyCompletion failed");
            }
            task_completions_ids.push(updateTaskId);
          } else {
            const completedTaskId = await addSurveyCompletion(
              {
                survey_id: survey_id,
                survey_task_id: item.survey_task_id,
                user_id: user_id,
                operator_id: operator_id,
                result_main: item.result,
                result_positions: item.result_positions,
                reward_user: isAllSameAnswer ? item.reward_user : 0,
                reward_operator: isAllSameAnswer ? item.reward_operator : 0,
                video_id: video_id,
              },
              trx,
            );
            if (!completedTaskId) {
              throw new Error("Survey Completion add failed");
            }
            task_completions_ids.push(completedTaskId);
          }
          reward_user += Number(item.reward_user);
          reward_operator += Number(item.reward_operator);
        } else if (!item.isCompleted && item.completion_id) {
          const isDeleteSurveyTaskComplId = await deleteSurveyCompletion(
            item.completion_id,
            trx,
          );
          if (!isDeleteSurveyTaskComplId) {
            throw new Error("deleteSurveyCompletion failed");
          }
        }
      }

      //добавление записи на проверку аудитору
      if (!isAllSameAnswer) {
        const addAuditSurveyActiveId = await addAuditSurveyActive(
          {
            user_id: user_id,
            survey_id: survey_id,
            operator_id: operator_id,
            video_id: video_id,
            task_completions_ids: task_completions_ids,
          },
          trx,
        );
        if (!addAuditSurveyActiveId) {
          throw new Error("addAuditSurveyActive failed");
        }
      }
      const isBalanceUpdate = await updateUserByUserId(
        user_id,
        {
          add_balance: isAllSameAnswer ? reward_user : 0,
        },
        trx,
      );
      if (!isBalanceUpdate) {
        throw new Error("updateUserByUserId filed");
      }
      const isBalanceOperatorUpdate = await updateOperatorByOperatorId(
        operator_id,
        {
          add_balance: isAllSameAnswer ? reward_operator : 0,
        },
        trx,
      );
      if (!isBalanceOperatorUpdate) {
        throw new Error("updateOperatorByOperatorId filed");
      }
    });
  } catch (error) {
    throw new Error("Error userRecheckSurvey: " + error);
  }
}
