import {Message} from "grammy/types";

import logger from "../../lib/logger";
import {getUserId} from "../../bot-common/utils/getUserId";
import {findUser} from "../utils/findUser";
import {
    addSurveyInActive,
    getAvailableSurveyForRegion,
    isUserInSurveyActive
} from "../../database/queries/surveyQueries";
import {formatTimestamp} from "../../lib/date";
import {Conversation} from "@grammyjs/conversations";
import {RegionSettings} from "../../database/queries/regionQueries";
import {Operator} from "../../database/queries/operatorQueries";
import {RESPONSES} from "../../bot-common/constants/responses";
import {AuthUserKeyboard, sendLocation} from "../../bot-common/keyboards/keyboard";
import {SURVEY_USER_SCENE} from "../../bot-common/constants/scenes";
import {MyContext, MyConversation, MyConversationContext, LocationType} from "../../bot-common/types/type";

export async function surveyScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
): Promise<Message.TextMessage | void> {
    try {
        const userId = await conversation.external(() => getUserId(ctx));
        if (!userId) return

        const user = await conversation.external(() => findUser(userId, ctx));
        if (!user) return;

        const nowTimespan = await conversation.now();
        const lockUntilTimespan = user.survey_lock_until ?Number(new Date(user.survey_lock_until)):null


        // Шаг 1: Проверка, может ли пользователь проходить опрос
        const is_survey_lock_now = lockUntilTimespan ? lockUntilTimespan > nowTimespan : false
        if (is_survey_lock_now) {
            await ctx.reply(
                `${SURVEY_USER_SCENE.USER_LOCK_UNTIL} ${formatTimestamp(lockUntilTimespan??0)}.`,
                {
                    reply_markup: AuthUserKeyboard(),
                },
            );
            return
        }

        const isInProgress = await isUserInSurveyActive(user.user_id);
        if(isInProgress){
            await ctx.reply(SURVEY_USER_SCENE.USER_BUSY, {
                reply_markup: AuthUserKeyboard(),
            });
            return
        }


        // Шаг 2: Ожидаем локацию
        const location = await stepLocation(conversation, ctx, userId);
        if (!location) {
            await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
                reply_markup: AuthUserKeyboard(),
            });
            return;
        }

        // const region = await findRegionByLocation(location);
        // if (!region) {
        //     await ctx.reply(SURVEY_USER_SCENE.REGION_NOT_FOUND, {
        //         reply_markup: AuthUserKeyboard(),
        //     });
        //     return
        // }


        // Шаг 3:  Ищем опрос
        const survey = {survey_id: 1}//await stepSearchSurvey(ctx, region);
        if (!survey) {
            await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
                reply_markup: AuthUserKeyboard(),
            });
            return;
        }

        //Шаг 5: меняем статус пользователю, оператору и запросу.
        const isSuccess = await reservationStep(userId, survey.survey_id);

        if (isSuccess) {
            return ctx.reply(
                //`Оператор @${'andrei_s086'} ${SURVEY_USER_SCENE.SUCCESS}`,
                `${SURVEY_USER_SCENE.SUCCESS}`,
                {reply_markup: AuthUserKeyboard()},
            );
        } else {
            return ctx.reply(SURVEY_USER_SCENE.FAILED, {
                reply_markup: AuthUserKeyboard(),
            });
        }
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        logger.error("Error in survey: " + shortError);
        await ctx.reply(RESPONSES.SOME_ERROR);
    }
}

async function stepLocation(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
    userId: number
){
    try {
        await ctx.reply(SURVEY_USER_SCENE.ENTER_LOCATION, {
            parse_mode: "HTML",
            reply_markup: sendLocation(),
        });

        let location: LocationType | null = null
        //Два выхода из цикла — локация юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:location", {
                otherwise: (ctx) => ctx.reply(SURVEY_USER_SCENE.ENTER_LOCATION_OTHERWISE, {
                    parse_mode: "HTML",
                    reply_markup: sendLocation(),
                }),
            });

            if (!response.message?.location) break


            if ('forward_date' in response.message) {
                await ctx.reply(SURVEY_USER_SCENE.ENTERED_NOT_USER_LOCATION, {
                    parse_mode: "HTML",
                    reply_markup: sendLocation(),
                });
                continue
            }

            location  =  response.message.location;
            break
        }

        return location;
    } catch (error) {
        logger.info("stepRegion: Ошибка:", error);
        return null;
    }
}

async function stepSearchSurvey(
    ctx: MyConversationContext,
    region: RegionSettings,
): Promise<{ surveyId: number } | null> {
    try{
        const survey = await getAvailableSurveyForRegion(region.region_id);

        if (!survey) {
            await ctx.reply(SURVEY_USER_SCENE.SURVEY_NOT_FOUND, {
                reply_markup: AuthUserKeyboard(),
            });
        }

        return survey
    } catch (err){
        return null
    }
}

async function stepSearchOperator(
    ctx: MyContext,
    region: RegionSettings,
): Promise<Operator | null> {
    const freeOperator:any =[]// await getOperatorsByRegionAndStatus(region.region_id, "free",);
    if (freeOperator.length === 0) {
        await ctx.reply(SURVEY_USER_SCENE.OPERATOR_NOT_FOUND, {
            reply_markup: AuthUserKeyboard(),
        });
        return null;
    }
    return freeOperator[0];
}

async function reservationStep(
    userId: number,
    survey_id: number,
): Promise<boolean> {
    try {

        // Обновляем опрос
        await addSurveyInActive(
            survey_id,
            userId,
        );
        return true;
    } catch (error) {

        return false;
    }
}
// import {Message} from "grammy/types";
// import {LocationType, MyContext, MyConversation, MyConversationContext} from "../../types/type";
//
// import {MESSAGES} from "../../constants/messages";
// import logger from "../../../lib/logger";
// import {getUserId} from "../../../bot-common/utils/getUserId"
;
// import {findUser} from "../../utils/findUser";
// import {
//     addSurveyInActive,
//     getAvailableSurveyForRegion,
//     isUserInSurveyActive
// } from "../../../database/queries/surveyQueries";
// import {formatTimestamp} from "../../../lib/date";
// import {SURVEY_USER_SCENE} from "./text";
// import {
//     AuthUserKeyboard,
//     RegistrationKeyboard,
//     sendLocation,
//     sendUserPhone,
//     WebAppKeyboard
// } from "../../keyboards/inline";
// import {Conversation} from "@grammyjs/conversations";
// import {REGISTRATION_SCENE} from "../registration/text";
// import {findRegionByLocation} from "../../../utils/regionUtils";
// import {RegionSettings} from "../../../database/queries/regionQueries";
// import {Operator} from "../../../database/queries/operatorQueries";
//
// export async function survey(
//     conversation: MyConversation,
//     ctx: MyConversationContext,
// ): Promise<Message.TextMessage | void> {
//     try {
//         const userId = await conversation.external(() => getUserId(ctx));
//         if (!userId) return
//
//         const user = await conversation.external(() => findUser(userId, ctx));
//         if (!user) return;
//
//         const nowTimespan = await conversation.now();
//         const lockUntilTimespan = user.survey_lock_until ?Number(new Date(user.survey_lock_until)):null
//
//
//         // Шаг 1: Проверка, может ли пользователь проходить опрос
//         const is_survey_lock_now = lockUntilTimespan ? lockUntilTimespan > nowTimespan : false
//         if (is_survey_lock_now) {
//             await ctx.reply(
//                 `${SURVEY_USER_SCENE.USER_LOCK_UNTIL} ${formatTimestamp(lockUntilTimespan??0)}.`,
//                 {
//                     reply_markup: AuthUserKeyboard(),
//                 },
//             );
//             return
//         }
//
//         const isInProgress = await isUserInSurveyActive(user.user_id);
//         if(isInProgress){
//             await ctx.reply(SURVEY_USER_SCENE.USER_BUSY, {
//                 reply_markup: AuthUserKeyboard(),
//             });
//             return
//         }
//
//
//         // Шаг 2: Ожидаем локацию
//         const location = await stepLocation(conversation, ctx, userId);
//         if (!location) {
//             await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
//                 reply_markup: AuthUserKeyboard(),
//             });
//             return;
//         }
//
//         // const region = await findRegionByLocation(location);
//         // if (!region) {
//         //     await ctx.reply(SURVEY_USER_SCENE.REGION_NOT_FOUND, {
//         //         reply_markup: AuthUserKeyboard(),
//         //     });
//         //     return
//         // }
//
//
//         // Шаг 3:  Ищем опрос
//         const survey = {survey_id: 1}//await stepSearchSurvey(ctx, region);
//         if (!survey) {
//             await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
//                 reply_markup: AuthUserKeyboard(),
//             });
//             return;
//         }
//
//         // Шаг 4:  Ищем свободного оператора
//         const operator = {operator_id: 1}//await searchOperatorStep(ctx, region);
//         if (!operator) return;
//
//         //Шаг 5: меняем статус пользователю, оператору и запросу.
//         const isSuccess = await reservationStep(userId, operator.operator_id, survey.survey_id);
//
//         if (isSuccess) {
//             return ctx.reply(
//                 `Оператор @${'andrei_s086'} ${SURVEY_USER_SCENE.SUCCESS}`,
//                 {reply_markup: AuthUserKeyboard()},
//             );
//         } else {
//             return ctx.reply(SURVEY_USER_SCENE.FAILED, {
//                 reply_markup: AuthUserKeyboard(),
//             });
//         }
//     } catch (error) {
//         let shortError = "";
//         if (error instanceof Error) {
//             shortError = error.message.substring(0, 50);
//         } else {
//             shortError = String(error).substring(0, 50);
//         }
//         logger.error("Error in survey: " + shortError);
//         await ctx.reply(RESPONSES.SOME_ERROR);
//     }
// }
//
// async function stepLocation(
//     conversation: Conversation<MyContext, MyConversationContext>,
//     ctx: MyConversationContext,
//     userId: number
// ){
//     try {
//         await ctx.reply(SURVEY_USER_SCENE.ENTER_LOCATION, {
//             parse_mode: "HTML",
//             reply_markup: sendLocation(),
//         });
//
//         let location: LocationType | null = null
//         //Два выхода из цикла — локация юзера получен либо произошла ошибка(скорее всего на стороне тг)
//         while (true) {
//             const response = await conversation.waitFor("message:location", {
//                 otherwise: (ctx) => ctx.reply(SURVEY_USER_SCENE.ENTER_LOCATION_OTHERWISE, {
//                     parse_mode: "HTML",
//                     reply_markup: sendLocation(),
//                 }),
//             });
//
//             if (!response.message?.location) break
//
//
//             if ('forward_date' in response.message) {
//                 await ctx.reply(SURVEY_USER_SCENE.ENTERED_NOT_USER_LOCATION, {
//                     parse_mode: "HTML",
//                     reply_markup: sendLocation(),
//                 });
//                 continue
//             }
//
//             location  =  response.message.location;
//             break
//         }
//
//         return location;
//     } catch (error) {
//         logger.info("stepRegion: Ошибка:", error);
//         return null;
//     }
// }
//
// async function stepSearchSurvey(
//     ctx: MyConversationContext,
//     region: RegionSettings,
// ): Promise<{ surveyId: number } | null> {
//     try{
//         const survey = await getAvailableSurveyForRegion(region.region_id);
//
//         if (!survey) {
//             await ctx.reply(SURVEY_USER_SCENE.SURVEY_NOT_FOUND, {
//                 reply_markup: AuthUserKeyboard(),
//             });
//         }
//
//         return survey
//     } catch (err){
//         return null
//     }
// }
//
// async function stepSearchOperator(
//     ctx: MyContext,
//     region: RegionSettings,
// ): Promise<Operator | null> {
//     const freeOperator:any =[]// await getOperatorsByRegionAndStatus(region.region_id, "free",);
//     if (freeOperator.length === 0) {
//         await ctx.reply(SURVEY_USER_SCENE.OPERATOR_NOT_FOUND, {
//             reply_markup: AuthUserKeyboard(),
//         });
//         return null;
//     }
//     return freeOperator[0];
// }
//
// async function reservationStep(
//     userId: number,
//     operator_id: number,
//     survey_id: number,
// ): Promise<boolean> {
//     try {
//
//         // Обновляем опрос
//         await addSurveyInActive(
//             survey_id,
//             userId,
//             operator_id,
//         );
//         return true;
//     } catch (error) {
//
//         return false;
//     }
// }
