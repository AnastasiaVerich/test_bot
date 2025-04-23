import {MyConversation, MyConversationContext} from "../../types/type";
import logger from "../../../lib/logger";
import {MESSAGES} from "../../constants/messages";
import {getUserId, returnUserId} from "../../utils/getUserId";
import {AuthUserKeyboard, IdentificationKeyboard, RegistrationKeyboard, WebAppKeyboard} from "../../keyboards/inline";
import {findUserByTelegramId, updateUserLastInit} from "../../../database/queries/userQueries";
import {IDENTIFICATION_SCENE} from "./text";

export async function identificationScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
): Promise<void> {
    try {
        const userId = await conversation.external(() => getUserId(ctx));
        if (!userId) return

        const user = await conversation.external(() => findUserByTelegramId(userId));
        if (!user) {
            await ctx.reply(IDENTIFICATION_SCENE.USER_NOT_EXIST, {
                reply_markup: RegistrationKeyboard(),
            });
            return;
        }

        const response = await photoStep(conversation, ctx, userId);
        if (!response) {
            await ctx.reply(IDENTIFICATION_SCENE.SOME_ERROR, {
                reply_markup: IdentificationKeyboard(),
            });
        }
        return;
    } catch (error) {
        const userId = await returnUserId(ctx);

        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        logger.error(userId + ": Error in identificationScene: " + shortError);
        await ctx.reply(MESSAGES.SOME_ERROR);
        return;
    }
}

export async function photoStep(
    conversation: MyConversation,
    ctx: MyConversationContext,
    userId: number,
) {
    try {
        let result = null

        await ctx.reply(IDENTIFICATION_SCENE.VERIFY_BY_PHOTO, {
            reply_markup: WebAppKeyboard(userId, "", "identification", "0"),
        });

        const message_web_app_data = await conversation.waitFor("message:web_app_data", {
                otherwise: (ctx) => ctx.reply(IDENTIFICATION_SCENE.VERIFY_BY_PHOTO_OTHERWISE, {
                    reply_markup: WebAppKeyboard(userId, "", "identification", "0"),
                }),
            }
        );

        if (message_web_app_data.message?.web_app_data) {
            const data = await JSON.parse(message_web_app_data.message.web_app_data.data);
            result = data.text
            switch (result) {
                case "user_is_block": {
                    await ctx.reply(IDENTIFICATION_SCENE.USER_IN_BLOCK, {
                        reply_markup: {remove_keyboard: true},
                    });
                }
                    break;
                case "similarity_not_confirmed": {
                    await ctx.reply(IDENTIFICATION_SCENE.NOT_SIMILAR, {
                        reply_markup: {remove_keyboard: true},
                    });
                }
                    break;
                case "success": {
                    await ctx.reply(IDENTIFICATION_SCENE.SUCCESS, {
                        reply_markup: AuthUserKeyboard(),
                    });
                    await updateUserLastInit(userId)
                }
                    break;
                default: {
                    result = null
                    await ctx.reply(IDENTIFICATION_SCENE.SOME_ERROR, {
                        reply_markup: IdentificationKeyboard(),
                    });
                }
            }
        }

        return result;
    } catch (error) {
        logger.error(": Error faceCheckStep: " + error);
        return null;
    }
}
