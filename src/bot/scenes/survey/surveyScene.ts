import {Conversation} from "@grammyjs/conversations";
import {LocationType, MyContext} from "../../../types/type";
import {InlineKeyboard, Keyboard} from "grammy";
import {
    INPUT_LOCATION,
    LOCATION_FAILED,
    OPERATOR_NOT_FOUND,
    REGION_NOT_FOUND,
    SURVEY_NOT_FOUND,
    SURVEY_SUCCESS,
    USER_CANT_SURVEY
} from "./constants";
import {BUTTONS} from "../../../constants/constants";
import {MenuAuthUser} from "../../../keyboards/inline/menuAuthUser";
import {findRegionByLocation} from "../../../database/queries/regionQueries";
import {
    checkAndUpdateSurveyStatus,
    findAvailableSurvey,
    getRecentSurveyTypesForUser
} from "../../../database/queries/surveyQueries";
import {findUserByTelegramId} from "../../../database/queries/userQueries";
import {getOperatorByRegionAndStatus} from "../../../database/queries/operatorQueries";


export async function surveyScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id

    if (!userId) {
        return ctx.reply("Ошибка: не удалось получить информацию о пользователе.");
    }

    // Шаг 1: Проверка, может и пользователь проходит опрос
    const user = await findUserByTelegramId(userId)

    if (user.allowed_survey_after && Number(new Date(user.allowed_survey_after)) > Number(new Date())) {
        await ctx.reply(`${USER_CANT_SURVEY} ${formatTimestamp(Number(user.allowed_survey_after))}`, {
            reply_markup:  new InlineKeyboard()
                .text(BUTTONS.SurveyButtonText, BUTTONS.SurveyButton)
                .row()
                .text(BUTTONS.InviteButtonText,BUTTONS.InviteButton)
                .text(BUTTONS.BalanceButtonText,BUTTONS.BalanceButton),
        });
        return
    }

    // Шаг 2: Ожидаем локацию
    await ctx.reply(INPUT_LOCATION, {
        reply_markup: new Keyboard()
            .requestLocation(BUTTONS.GeolocationButtonText)
            .resized()
            .oneTime(),
    });

    const message = await conversation.waitFor("message:location");

    const location: LocationType = message.message?.location

    if (!location.latitude || !location.longitude) {
        await ctx.reply(LOCATION_FAILED, {
            reply_markup: new InlineKeyboard()
                .text(BUTTONS.SurveyButtonText, BUTTONS.SurveyButton)
                .row()
                .text(BUTTONS.InviteButtonText, BUTTONS.InviteButton)
                .text(BUTTONS.BalanceButtonText, BUTTONS.BalanceButton),
        });
        return
    }
    const region = await findRegionByLocation(location)

    if (!region) {
        await ctx.reply(REGION_NOT_FOUND, {
            reply_markup: new InlineKeyboard()
                .text(BUTTONS.SurveyButtonText, BUTTONS.SurveyButton)
                .row()
                .text(BUTTONS.InviteButtonText, BUTTONS.InviteButton)
                .text(BUTTONS.BalanceButtonText, BUTTONS.BalanceButton),
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
        await ctx.reply(SURVEY_NOT_FOUND, {
            reply_markup: new InlineKeyboard()
                .text(BUTTONS.SurveyButtonText, BUTTONS.SurveyButton)
                .row()
                .text(BUTTONS.InviteButtonText, BUTTONS.InviteButton)
                .text(BUTTONS.BalanceButtonText, BUTTONS.BalanceButton),
        });
        return
    }

    const freeOperator = await getOperatorByRegionAndStatus(userId, 'free')

    if (freeOperator.length === 0) {
        await ctx.reply(OPERATOR_NOT_FOUND, {
            reply_markup: new InlineKeyboard()
                .text(BUTTONS.SurveyButtonText, BUTTONS.SurveyButton)
                .row()
                .text(BUTTONS.InviteButtonText, BUTTONS.InviteButton)
                .text(BUTTONS.BalanceButtonText, BUTTONS.BalanceButton),
        });
        return
    }

    await ctx.reply(`Оператор @${freeOperator[0].tg_account} ${SURVEY_SUCCESS}`, {
        reply_markup: MenuAuthUser(),
    });
}
