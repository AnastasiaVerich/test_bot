import {RegionSettingsType, SurveyActiveType, SurveysType, UsersType} from "../db-types";
import {db, pool} from "../dbClient";
import {
    addSurveyActive,
    deleteActiveSurvey,
    isInSurveyActive,
    setActiveSurveyOperatorIdIfNull,
    updateActiveSurvey
} from "../queries_kysely/survey_active";
import {addSurvey, getSurveyById, updateSurvey} from "../queries_kysely/surveys";
import {addSurveyTask} from "../queries_kysely/survey_tasks";
import logger from "../../lib/logger";
import {getRegionById} from "../queries_kysely/region_settings";
import {addSurveyCompletion} from "../queries_kysely/survey_completions";
import {updateUserByUserId} from "../queries_kysely/users";
import {getReferralByReferredUserIdAndStatus, updateReferralByReferredUserId} from "../queries_kysely/referral_bonuses";

export async function reservationSurveyActiveByOperator(
    params: {
        operatorId: SurveyActiveType['operator_id'],
        surveyActiveId: SurveyActiveType['survey_active_id'],
        reservationMinutes: RegionSettingsType['reservation_time_min']
    }
): Promise<'ok' | undefined> {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        const {
            operatorId,
            surveyActiveId,
            reservationMinutes,
        } = params

        const activeSurvey = setActiveSurveyOperatorIdIfNull(surveyActiveId, operatorId,)
        if (!activeSurvey) return

        const resultUpdate = await updateActiveSurvey(surveyActiveId, {
            reservationMinutes: reservationMinutes
        })
        if (!resultUpdate) {
            throw new Error("Не удалось обновить reservationMinutes");
        }

        await client.query('COMMIT'); // Завершаем транзакцию

        return 'ok'
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        throw new Error("Error reservationSurveyActiveByOperator: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }

}

export async function checkCanUserTakeSurvey(
    user: UsersType
): Promise<{
    result: boolean,
    reason?: 'userInSurveyActive' | 'is_survey_lock',
    surveyUntil?: number | null
}> {
    try {
        const userInSurveyActive = await isInSurveyActive({
            userId: user.user_id
        })
        if (userInSurveyActive) return {result: false, reason: 'userInSurveyActive'}

        const nowTimespan = Number(new Date())
        const lockUntilTimespan = user.survey_lock_until ? Number(new Date(user.survey_lock_until)) : null
        const is_survey_lock = lockUntilTimespan ? lockUntilTimespan > nowTimespan : false
        if (is_survey_lock) return {result: false, reason: 'is_survey_lock', surveyUntil: lockUntilTimespan}

        return {result: true}

    } catch (error) {
        throw new Error("Error canOperatorTakeSurvey: " + error);

    }
}

export async function takeSurveyByUser(
    params: {
        surveyId: number,
        userId: number,
        tg_account: string | null,
        code_word: string | null,
        location_string: string
    }
): Promise<void> {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        const {
            surveyId,
            userId,
            tg_account,
            code_word,
            location_string,
        } = params

        const isUpd = await updateSurvey(surveyId, {increment_count: 1})
        if (!isUpd) {
            throw new Error("updateSurvey не обновилась");
        }
        await addSurveyActive({
            surveyId: surveyId,
            userId: userId,
            tgAccount: tg_account,
            codeWord: code_word,
            userLocation: location_string,
        })

        await client.query('COMMIT'); // Завершаем транзакцию

        return
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        throw new Error("Error takeSurveyByUser: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
}

export async function cancelTakeSurveyByUser(
    surveyActiveId: SurveyActiveType['survey_active_id'],
    surveyId: SurveyActiveType['survey_id']
): Promise<void> {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        await client.query('BEGIN'); // Начинаем транзакцию

        const isDeleteActiveSurveyId = await deleteActiveSurvey(surveyActiveId)
        if (!isDeleteActiveSurveyId) {
            throw new Error('Survey active delete failed')
        }

        const isUpd = await updateSurvey(surveyId, {decrement_count: 1})
        if (!isUpd) {
            throw new Error('Survey updating failed')
        }

        await client.query('COMMIT'); // Завершаем транзакцию

        return
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        throw new Error("Error cancelTakeSurveyByUser: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
}

export async function addNewSurveyWithTasks(
    params: {
        region_id: number,
        survey_type: SurveysType['survey_type'],
        topic: string,
        description: string,
        completion_limit: number,
        task_price: number,
        tasks: {
            description: string;
            data: string;
        }[]
    }
): Promise<'ok' | undefined> {
    const client = await db.connect(); // Получаем клиента для транзакции

    try {
        await client.query('BEGIN'); // Начинаем транзакцию


        const {
            region_id,
            survey_type,
            topic,
            description,
            completion_limit,
            task_price,
            tasks,
        } = params

        const newSurveyId = await addSurvey({
            completionLimit: completion_limit,
            description: description,
            regionId: region_id,
            surveyType: survey_type,
            taskPrice: task_price,
            topic: topic
        })
        if (!newSurveyId) {
            throw new Error('Survey insert failed')
        }
        for (const task of tasks) {
            const insertTaskId = await addSurveyTask({
                surveyId: newSurveyId,
                description: task.description,
                data: task.data
            })
            if (!insertTaskId) {
                throw new Error('Survey task insert failed');
            }
        }
        await client.query('COMMIT'); // Завершаем транзакцию
        return 'ok'
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        logger.error("Error addNewSurveyWithTasks: " + error);
        return
    } finally {
        client.release(); // Освобождаем клиента
    }

}

export async function getInfoAboutSurvey(
    surveyId: number,
): Promise<RegionSettingsType & SurveysType | undefined> {
    try {

        const survey = await getSurveyById(surveyId)
        if (!survey) return

        const region = await getRegionById(survey.region_id)
        if (!region) return
        return {
            ...survey,
            ...region,
        }

    } catch (error) {
        throw new Error('Error getSurveyActiveInfo: ' + error);
    }
}

export async function userCompletedSurvey2(
    params: {
        surveyActiveId: number,
        user_id: number,
        survey_id: number,
        operator_id: number,
    },
    result: {
        survey_task_id: number;
        isCompleted: boolean,
        result?: string,
        result_positions?: string,
        reward?: number;
    }[],
): Promise<any> {
    const client = await db.connect(); // Получаем клиента для транзакции
    try {
        const {
            surveyActiveId,
            user_id,
            survey_id,
            operator_id
        } = params
        await client.query('BEGIN'); // Начинаем транзакцию

        const isDeleteActiveSurveyId = await deleteActiveSurvey(surveyActiveId)
        if (!isDeleteActiveSurveyId) {
            throw new Error('Survey active delete failed')
        }
        let reward = 0
        for (const item of result) {
            if (item.isCompleted && item.result !== undefined && item.result_positions !== undefined && item.reward !== undefined) {
                const completedTaskId = await addSurveyCompletion({
                    survey_id: survey_id,
                    survey_task_id: item.survey_task_id,
                    user_id: user_id,
                    operator_id: operator_id,
                    result_main: item.result,
                    result_positions: item.result_positions,
                    reward: item.reward,
                })
                if (!completedTaskId) {
                    throw new Error('Survey Completion add failed')
                }
                reward += Number(item.reward)
            }
        }

        const isBalanceUpdate = await updateUserByUserId(user_id, {
            add_balance: reward
        });
        if (!isBalanceUpdate) {
            throw new Error('UpdateBalance filed')
        }

        const referral_data = await getReferralByReferredUserIdAndStatus(user_id, 'pending')

        if (referral_data) {
            const sum_regard = 100
            const isUpdateRes = await updateReferralByReferredUserId(user_id, {status: 'completed', amount: sum_regard})
            if (!isUpdateRes) {
                throw new Error('updateReferralByReferredUserId filed')
            }
            const isBalanceUpdate = await updateUserByUserId(referral_data.referrer_id, {
                add_balance: sum_regard
            });
            if (!isBalanceUpdate) {
                throw new Error('updateUserByUserId 2 filed')
            }
        }


        await client.query('COMMIT'); // Завершаем транзакцию

        return
    } catch (error) {
        await client.query('ROLLBACK'); // Откатываем при ошибке
        throw new Error("Error userCompletedSurvey: " + error);
    } finally {
        client.release(); // Освобождаем клиента
    }
}


export async function userCompletedSurvey(
    params: {
        surveyActiveId: number,
        user_id: number,
        survey_id: number,
        operator_id: number,
        survey_interval: string,
    },
    result: {
        survey_task_id: number;
        isCompleted: boolean,
        result?: string,
        result_positions?: string,
        reward?: number;
    }[],
): Promise<any> {
    try {
        const {
            surveyActiveId,
            user_id,
            survey_id,
            operator_id,
            survey_interval,
        } = params

        return await pool.transaction().execute(async (trx) => {


            const isDeleteActiveSurveyId = await deleteActiveSurvey(surveyActiveId,trx)
            if (!isDeleteActiveSurveyId) {
                throw new Error('Survey active delete failed')
            }
            let reward = 0
            for (const item of result) {
                if (item.isCompleted && item.result !== undefined && item.result_positions !== undefined && item.reward !== undefined) {
                    const completedTaskId = await addSurveyCompletion({
                        survey_id: survey_id,
                        survey_task_id: item.survey_task_id,
                        user_id: user_id,
                        operator_id: operator_id,
                        result_main: item.result,
                        result_positions: item.result_positions,
                        reward: item.reward,
                    },trx)
                    if (!completedTaskId) {
                        throw new Error('Survey Completion add failed')
                    }
                    reward += Number(item.reward)
                }
            }

            const isBalanceUpdate = await updateUserByUserId(user_id, {
                add_balance: reward,
                notifyReason:'finish_survey',
                interval_survey_lock_until:survey_interval
            },trx);
            if (!isBalanceUpdate) {
                throw new Error('UpdateBalance filed')
            }

            const referral_data = await getReferralByReferredUserIdAndStatus(user_id, 'pending',trx)

            if (referral_data) {
                const sum_regard = 100
                const isUpdateRes = await updateReferralByReferredUserId(user_id, {
                    status: 'completed',
                    amount: sum_regard
                },trx)
                if (!isUpdateRes) {
                    throw new Error('updateReferralByReferredUserId filed')
                }
                const isBalanceUpdate = await updateUserByUserId(referral_data.referrer_id, {
                    add_balance: sum_regard
                },trx);
                if (!isBalanceUpdate) {
                    throw new Error('updateUserByUserId 2 filed')
                }
            }
        })

    } catch (error) {
        throw new Error("Error userCompletedSurvey: " + error);
    }
}
