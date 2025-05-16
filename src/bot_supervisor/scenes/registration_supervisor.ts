import logger from "../../lib/logger";
import {getUserId} from "../../bot-common/utils/getUserId";
import {RegistrationKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {sendUserPhone, SupervisorSettingKeyboard} from "../../bot-common/keyboards/keyboard";
import {MyConversation, MyConversationContext} from "../../bot-common/types/type";
import {getUserAccount} from "../../bot-common/utils/getUserTgAccount";
import {REGISTRATION_SUPERVISOR_SCENE} from "../../bot-common/constants/scenes";
import {updateSupervisorByTgAccount} from "../../database/queries_kysely/supervisor";

export async function registrationSupervisorScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
) {
    try {
        const userId = await getUserId(ctx);
        if (!userId) return

        const userAccount =  await getUserAccount(ctx);
        if (!userAccount) return;

        const userPhone = await phoneStep(conversation, ctx, userId);
        if (userPhone === null) {
            await ctx.reply(REGISTRATION_SUPERVISOR_SCENE.SOME_ERROR, {
                reply_markup: RegistrationKeyboard(),
            });
            return;
        }

        await conversation.external(()=> updateSupervisorByTgAccount(userAccount,{supervisor_id:userId, phone:userPhone}));
        await ctx.reply(`${REGISTRATION_SUPERVISOR_SCENE.SUCCESS}`, {
            parse_mode:'HTML',
            reply_markup: SupervisorSettingKeyboard(),
        });
        return

    } catch (error) {
        logger.error("Error in registrationScene: " + error);
        await ctx.reply(REGISTRATION_SUPERVISOR_SCENE.SOME_ERROR, {
            reply_markup: RegistrationKeyboard(),
        });
    }
}


async function phoneStep(
    conversation: MyConversation,
    ctx: MyConversationContext,
    userId: number

) {

    try {
        await ctx.reply(REGISTRATION_SUPERVISOR_SCENE.ENTER_PHONE, {
            parse_mode: "HTML",
            reply_markup: sendUserPhone(),
        });

        let phoneNumber: any = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:contact", {
                otherwise: (ctx) => ctx.reply(REGISTRATION_SUPERVISOR_SCENE.ENTER_PHONE_OTHERWISE, {
                    parse_mode: "HTML",
                    reply_markup: sendUserPhone(),
                }),
            });

            if (!response.message?.contact) break

            const contact = response.message.contact;
            const contactUserId = contact.user_id;

            if (contactUserId !== userId) {
                await ctx.reply(REGISTRATION_SUPERVISOR_SCENE.ENTERED_NOT_USER_PHONE, {
                    parse_mode: "HTML",
                    reply_markup: sendUserPhone(),
                });
                continue
            }
            phoneNumber = contact.phone_number;
            break
        }

        if (!phoneNumber) return

        await ctx.reply(`${REGISTRATION_SUPERVISOR_SCENE.ENTERED_USER_PHONE} ${phoneNumber}`, {
            reply_markup: {remove_keyboard: true},
        });

        return phoneNumber;
    } catch (error) {
        return null;
    }
}



