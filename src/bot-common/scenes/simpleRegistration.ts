import { Keyboard } from "grammy";
import logger from "../../lib/logger";
import { getUserId } from "../utils/getUserId";
import { RegistrationInlineKeyboard } from "../keyboards/inlineKeyboard";
import { SendUserPhoneKeyboard } from "../keyboards/keyboard";
import {
  entitiesType,
  MyConversation,
  MyConversationContext,
} from "../types/type";
import { getUserAccount } from "../utils/getUserTgAccount";
import { SIMPLE_REGISTRATION_SCENE } from "../constants/scenes";
import { registrationUser } from "../../database/services/registrationService";

export async function simpleRegistrationScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
  type: entitiesType,
  AuthKeyboard: Keyboard,
  link?: string,
) {
  try {
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;

    const userAccount = await getUserAccount(ctx);
    if (!userAccount) return;

    const userPhone = await phoneStep(conversation, ctx, userId);
    if (userPhone === null) {
      await ctx.reply(SIMPLE_REGISTRATION_SCENE.SOME_ERROR, {
        reply_markup: RegistrationInlineKeyboard(),
      });
      return;
    }

    await registrationUser({
      id: userId,
      userPhone: userPhone,
      userAccount: userAccount,
      type: type,
    });

    await ctx.reply(`${SIMPLE_REGISTRATION_SCENE.SUCCESS}`, {
      parse_mode: "HTML",
      reply_markup: AuthKeyboard,
    });
    if (link) {
      await ctx.reply(
        SIMPLE_REGISTRATION_SCENE.JOIN_THE_CHANNEL.replace("{link}", link),
        {
          parse_mode: "HTML",
          reply_markup: AuthKeyboard,
        },
      );
    }
    return;
  } catch (error) {
    logger.error("Error in simpleRegistrationScene: " + error);
    await ctx.reply(SIMPLE_REGISTRATION_SCENE.SOME_ERROR, {
      reply_markup: RegistrationInlineKeyboard(),
    });
  }
}

async function phoneStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  userId: number,
) {
  try {
    await ctx.reply(SIMPLE_REGISTRATION_SCENE.ENTER_PHONE, {
      parse_mode: "HTML",
      reply_markup: SendUserPhoneKeyboard(),
    });

    let phoneNumber: any = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:contact", {
        otherwise: (ctx) =>
          ctx.reply(SIMPLE_REGISTRATION_SCENE.ENTER_PHONE_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: SendUserPhoneKeyboard(),
          }),
      });

      if (!response.message?.contact) break;

      const contact = response.message.contact;
      const contactUserId = contact.user_id;

      if (contactUserId !== userId) {
        await ctx.reply(SIMPLE_REGISTRATION_SCENE.ENTERED_NOT_USER_PHONE, {
          parse_mode: "HTML",
          reply_markup: SendUserPhoneKeyboard(),
        });
        continue;
      }
      phoneNumber = contact.phone_number;
      break;
    }

    if (!phoneNumber) return;

    await ctx.reply(
      `${SIMPLE_REGISTRATION_SCENE.ENTERED_USER_PHONE} ${phoneNumber}`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );

    return phoneNumber;
  } catch (error) {
    logger.error("Error in simpleRegistrationScene phoneStep: " + error);
    return null;
  }
}
