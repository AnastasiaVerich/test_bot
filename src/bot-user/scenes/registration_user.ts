import {Conversation} from "@grammyjs/conversations";
import logger from "../../lib/logger";
import {getUserId} from "../utils/getUserId";
import {findUserByTelegramId} from "../../database/queries/userQueries";

import {IdentificationKeyboard, RegistrationKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {AuthUserKeyboard, sendUserPhone, WebAppKeyboard} from "../../bot-common/keyboards/keyboard";
import {REGISTRATION_USER_SCENE} from "../../bot-common/constants/scenes";
import {MyContext, MyConversation, MyConversationContext} from "../../bot-common/types/type";


export async function registrationUserScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
) {
    try {
        const userId = await conversation.external(() => getUserId(ctx));
        if (!userId) return

        const user = await conversation.external(() => findUserByTelegramId(userId));
        if (user) {
            await ctx.reply(REGISTRATION_USER_SCENE.USER_EXIST, {
                reply_markup: IdentificationKeyboard(),
            });
            return;
        }

        const userPhone = await phoneStep(conversation, ctx, userId);
        if (userPhone === null) {
            await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
                reply_markup: RegistrationKeyboard(),
            });
            return;
        }

        const response = await photoStep(conversation, ctx, userId, userPhone);

        if (!response) {
            await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
                reply_markup: RegistrationKeyboard(),
            });
        }
        // Сбрасываем сессию
        await conversation.external((ctx) => {
            delete ctx.session.register.phoneNumber;
        });

        return

    } catch (error) {
        let shortError = error instanceof Error ? error.message.substring(0, 50) : String(error).substring(0, 50);
        logger.error("Error in registrationScene: " + shortError);
        await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
            reply_markup: RegistrationKeyboard(),
        });
    }
}

async function phoneStep(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
    userId: number
) {

    try {
        await ctx.reply(REGISTRATION_USER_SCENE.ENTER_PHONE, {
            parse_mode: "HTML",
            reply_markup: sendUserPhone(),
        });

        let phoneNumber: any = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:contact", {
                otherwise: (ctx) => ctx.reply(REGISTRATION_USER_SCENE.ENTER_PHONE_OTHERWISE, {
                    parse_mode: "HTML",
                    reply_markup: sendUserPhone(),
                }),
            });

            if (!response.message?.contact) break

            const contact = response.message.contact;
            const contactUserId = contact.user_id;

            if (contactUserId !== userId) {
                await ctx.reply(REGISTRATION_USER_SCENE.ENTERED_NOT_USER_PHONE, {
                    parse_mode: "HTML",
                    reply_markup: sendUserPhone(),
                });
                continue
            }
            phoneNumber = contact.phone_number;
            break
        }

        if (!phoneNumber) return

        await ctx.reply(`${REGISTRATION_USER_SCENE.ENTERED_USER_PHONE} ${phoneNumber}`, {
            reply_markup: {remove_keyboard: true},
        });

        await conversation.external((ctx) => {
            ctx.session.register.phoneNumber = phoneNumber;
        });

        return phoneNumber;
    } catch (error) {
        return null;
    }
}

async function photoStep(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
    userId: number,
    userPhone: any
) {
    try {
        let result = null

        await ctx.reply(REGISTRATION_USER_SCENE.VERIFY_BY_PHOTO, {
            reply_markup: WebAppKeyboard(userId, userPhone, "registration", "1"),
        });

        const message_web_app_data = await conversation.waitFor("message:web_app_data", {
            otherwise: (ctx) => ctx.reply(REGISTRATION_USER_SCENE.VERIFY_BY_PHOTO_OTHERWISE, {
                reply_markup: WebAppKeyboard(userId, userPhone, "registration", "1"),
            }),
        });

        if (message_web_app_data.message?.web_app_data) {
            const data = JSON.parse(message_web_app_data.message.web_app_data.data);
            result = data.text
            logger.info(data)
            switch (result) {
                case "user_exist_number":
                case "user_exist_id":
                case "user_exist_face":
                    await ctx.reply(REGISTRATION_USER_SCENE.USER_EXIST, {
                        reply_markup: IdentificationKeyboard(),
                    });
                    break;
                case "user_is_block":
                    await ctx.reply(REGISTRATION_USER_SCENE.USER_IN_BLOCK, {
                        reply_markup: {remove_keyboard: true},
                    });
                    break;
                case "success":
                    await ctx.reply(REGISTRATION_USER_SCENE.SUCCESS, {
                        reply_markup: AuthUserKeyboard(),
                    });
                    break;
                default:
                    result = null
                    await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
                        reply_markup: RegistrationKeyboard(),
                    });
            }
        }

        return result;
    } catch (error) {
        logger.info("photoFinishStep: Ошибка:", error);
        await conversation.external((ctx) => {
            delete ctx.session.register.phoneNumber;
        });
        return null;
    }
}
