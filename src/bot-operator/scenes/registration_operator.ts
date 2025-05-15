import logger from "../../lib/logger";
import {getUserId} from "../../bot-common/utils/getUserId";
import {RegistrationKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {AuthMultiOperKeyboard, sendUserPhone} from "../../bot-common/keyboards/keyboard";
import {REGISTRATION_OPERATOR_SCENE} from "../../bot-common/constants/scenes";
import {MyConversation, MyConversationContext} from "../../bot-common/types/type";
import {getUserAccount} from "../../bot-common/utils/getUserTgAccount";
import {updateOperatorByTgAccount} from "../../database/queries_kysely/operators";

export async function registrationOperatorScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
) {
    try {
        const userId = await conversation.external(() => getUserId(ctx));
        if (!userId) return

        const userAccount = await getUserAccount(ctx);
        if (!userAccount) return;

        const userPhone = await phoneStep(conversation, ctx, userId);
        if (userPhone === null) {
            await ctx.reply(REGISTRATION_OPERATOR_SCENE.SOME_ERROR, {
                reply_markup: RegistrationKeyboard(),
            });
            return;
        }

        await updateOperatorByTgAccount(userAccount,{operator_id:userId, phone:userPhone});
        await ctx.reply(`${REGISTRATION_OPERATOR_SCENE.SUCCESS}`, {
            parse_mode:'HTML',
            reply_markup: AuthMultiOperKeyboard(),
        });
        return

    } catch (error) {
        logger.error("Error in registrationScene: " + error);
        await ctx.reply(REGISTRATION_OPERATOR_SCENE.SOME_ERROR, {
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
        await ctx.reply(REGISTRATION_OPERATOR_SCENE.ENTER_PHONE, {
            parse_mode: "HTML",
            reply_markup: sendUserPhone(),
        });

        let phoneNumber: any = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:contact", {
                otherwise: (ctx) => ctx.reply(REGISTRATION_OPERATOR_SCENE.ENTER_PHONE_OTHERWISE, {
                    parse_mode: "HTML",
                    reply_markup: sendUserPhone(),
                }),
            });

            if (!response.message?.contact) break

            const contact = response.message.contact;
            const contactUserId = contact.user_id;

            if (contactUserId !== userId) {
                await ctx.reply(REGISTRATION_OPERATOR_SCENE.ENTERED_NOT_USER_PHONE, {
                    parse_mode: "HTML",
                    reply_markup: sendUserPhone(),
                });
                continue
            }
            phoneNumber = contact.phone_number;
            break
        }

        if (!phoneNumber) return

        await ctx.reply(`${REGISTRATION_OPERATOR_SCENE.ENTERED_USER_PHONE} ${phoneNumber}`, {
            reply_markup: {remove_keyboard: true},
        });

        return phoneNumber;
    } catch (error) {
        return null;
    }
}
async function link(
    ctx: MyConversationContext,
    chatId: number
) {

    try {
        const botId = ctx.me.id; // ID бота
        const member = await ctx.api.getChatMember(chatId, botId);

        if (member.status !== "administrator") {
            await ctx.reply("У бота нет доступа к вашей группе, напишите в поддержку.!");
            return;
        }
        if (!member.can_invite_users) {
            await ctx.reply("У бота нет разрешения для приглошения новых пользователей. Напишите в поддержку.");
            return;
        }

        // Создаём одноразовую пригласительную ссылку
        const link = await ctx.api.createChatInviteLink(chatId, {
            member_limit: 1, // Ограничиваем до 1 использования
            name: `One-time link ${new Date().toISOString()}`, // Название ссылки для удобства
        });
        await ctx.reply(`Одноразовая пригласительная ссылка: ${link.invite_link}`);


    } catch (error) {
        return null;
    }
}


