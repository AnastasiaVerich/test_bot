import {Bot} from "grammy";
import {SurveyActive, SurveyCompletions, updateActiveSurveyIsJoinedToChat} from "../../database/queries/surveyQueries";
import {MyContext} from "../../bot-common/types/type";
import {findOperator} from "../../database/queries/operatorQueries";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import {updateUserNotifyReason, User} from "../../database/queries/userQueries";
import {formatTimestamp} from "../../lib/date";



async function processRecord(bot: Bot<MyContext>, record: User): Promise<void> {
    const { user_id, survey_lock_until } = record;
    const lockUntilTimespan = survey_lock_until?Number(new Date(survey_lock_until)):null

    let message =`Опрос пройден.`
    if(survey_lock_until){
        message+= `Следующий опрос будет доступен не раньше, чем ${formatTimestamp(lockUntilTimespan??0)}.`
    }
    try {
       await sendMessageWithRetry(bot,message,user_id);
       await updateUserNotifyReason(user_id, null)

    } catch (error) {
        console.error(`Ошибка при обработке записи ${user_id}:`, error);
    }
}

export async function subscribeFinishSurveyNotification(bot: Bot<MyContext>): Promise<void> {

    const query = `
        SELECT *
        FROM users
        WHERE notify_reason = 'finish_survey'
    `;
    await subscribeToChannel(bot, "finish_survey_notification", query, processRecord);
}
