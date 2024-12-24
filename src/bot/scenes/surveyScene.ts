import {Conversation} from "@grammyjs/conversations";
import {LocationType, MyContext} from "../types/type";
import {Keyboard} from "grammy";

import {findRegionByLocation} from "../../database/queries/regionQueries";
import {
    checkAndUpdateSurveyStatus,
    findAvailableSurvey,
    getRecentSurveyTypesForUser, reserveSurvey
} from "../../database/queries/surveyQueries";
import {findUserByTelegramId, updateUserStatus} from "../../database/queries/userQueries";
import {getOperatorsByRegionAndStatus, updateOperatorStatus} from "../../database/queries/operatorQueries";
import {AuthUserKeyboard} from "../keyboards/AuthUserKeyboard";
import {SURVEY_SCENE} from "../constants/scenes";
import {BUTTONS_KEYBOARD} from "../constants/button";
import {formatTimestamp} from "../../lib/date";


export async function surveyScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id

    if (!userId) {
        return ctx.reply("Ошибка: не удалось получить информацию о пользователе.");
    }

    // Шаг 1: Проверка, может ли пользователь проходит опрос
    const user = await findUserByTelegramId(userId)

    if (user.status ==='busy') {
        await ctx.reply(SURVEY_SCENE.USER_BUSY, {
            reply_markup:  AuthUserKeyboard(),
        });
        return
    }

    if (user.survey_lock_until && Number(new Date(user.survey_lock_until)) > Number(new Date())) {
        await ctx.reply(`${SURVEY_SCENE.USER_CANT_SURVEY} ${formatTimestamp(Number(user.survey_lock_until))}`, {
            reply_markup:  AuthUserKeyboard(),
        });
        return
    }


    // Шаг 2: Ожидаем локацию
    await ctx.reply(SURVEY_SCENE.INPUT_LOCATION, {
        reply_markup: new Keyboard()
            .requestLocation(BUTTONS_KEYBOARD.GeolocationButton)
            .resized()
            .oneTime(),
    });

    const message = await conversation.waitFor("message:location");

    const location: LocationType = message.message?.location

    if (!location.latitude || !location.longitude) {
        await ctx.reply(SURVEY_SCENE.LOCATION_FAILED, {
            reply_markup: AuthUserKeyboard(),
        });
        return
    }
    const region = await findRegionByLocation(location)

    if (!region) {
        await ctx.reply(SURVEY_SCENE.REGION_NOT_FOUND, {
            reply_markup: AuthUserKeyboard(),
        });
        return
    }


    // Шаг 3:  Ищем опрос

    // Достать темы, которые оператор проходил последние XX дней
    const recentSurveyTypes = await getRecentSurveyTypesForUser(userId, region.query_similar_topic_days)

    // Освобождаем опросы, которые возможно зря забронированы
    await checkAndUpdateSurveyStatus()

    //Найти опрос, который не соотвествует темам, которые пользователь уже проходил, который находится в этом регионе
    const survey = await findAvailableSurvey(userId, region.region_id, recentSurveyTypes);

    if (!survey) {
        await ctx.reply(SURVEY_SCENE.SURVEY_NOT_FOUND, {
            reply_markup: AuthUserKeyboard(),
        });
        return
    }

    const freeOperator = await getOperatorsByRegionAndStatus(region.region_id, 'free')

    if (freeOperator.length === 0) {
        await ctx.reply(SURVEY_SCENE.OPERATOR_NOT_FOUND, {
            reply_markup: AuthUserKeyboard(),
        });
        return
    }

    //Шаг 4: меняем статус пльзователю, оператору и запросу.

    // Обновляем статус пользователя
    await updateUserStatus(userId, 'busy'); // Предполагаем, что эта функция обновляет статус пользователя

    // Обновляем статус оператора
    await updateOperatorStatus(freeOperator[0].operator_id, 'busy'); // Обновляем статус оператора на 'busy'

    // Обновляем опрос
    await reserveSurvey(survey.survey_id, userId, freeOperator[0].operator_id, region.reservation_time_min);
    // Резервируем опрос для пользователя и оператора, устанавливаем время резерва


    await ctx.reply(`Оператор @${freeOperator[0].tg_account} ${SURVEY_SCENE.SUCCESS}`, {
        reply_markup: AuthUserKeyboard(),
    });
}
