import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";

import {
  IdentificationKeyboard,
  RegistrationKeyboard,
} from "../../bot-common/keyboards/inlineKeyboard";
import {
  AuthUserKeyboard,
  sendUserPhone,
  WebAppKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { REGISTRATION_USER_SCENE } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { addUser, getUser } from "../../database/queries_kysely/users";
import { isUserInBlacklist } from "../../database/queries_kysely/blacklist_users";
import { getOperatorByIdPhoneOrTg } from "../../database/queries_kysely/operators";
import { RegistrationResponseText } from "../../config/common_types";
import { addUserLogs } from "../../database/queries_kysely/bot_user_logs";

export async function registrationUserScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  try {
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;

    const user = await conversation.external(() =>
      getUser({ user_id: userId }),
    );
    if (user) {
      await ctx.reply(REGISTRATION_USER_SCENE.USER_EXIST, {
        reply_markup: IdentificationKeyboard(),
      });
      return;
    }
    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "registration",
        step: "start",
      }),
    );

    const userPhone = await phoneStep(conversation, ctx, userId);
    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "registration",
        step: "phone",
        event_data: JSON.stringify(userPhone),
      }),
    );

    if (userPhone === null) {
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "registration",
          step: "failed",
          event_data: JSON.stringify("userPhone is null"),
        }),
      );

      await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
        reply_markup: RegistrationKeyboard(),
      });
      return;
    }

    const response = await photoStep(conversation, ctx, userId, userPhone);

    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "registration",
        step: "photo",
        event_data: JSON.stringify(response),
      }),
    );

    if (!response) {
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "registration",
          step: "failed",
          event_data: JSON.stringify("registration failed"),
        }),
      );

      await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
        reply_markup: RegistrationKeyboard(),
      });

      return;
    }
    if (response === "success" || response === "skip_photo") {
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "registration",
          step: "success",
        }),
      );
    } else {
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "registration",
          step: "failed",
          event_data: JSON.stringify("registration failed"),
        }),
      );
    }

    return;
  } catch (error) {
    const userId = await conversation.external(() => getUserId(ctx));
    await conversation.external(() =>
      addUserLogs({
        user_id: userId ?? 0,
        event_type: "registration",
        step: "failed",
        event_data: JSON.stringify("some error"),
      }),
    );

    logger.error("Error in registrationScene: " + error);
    await ctx.reply(REGISTRATION_USER_SCENE.SOME_ERROR, {
      reply_markup: RegistrationKeyboard(),
    });
  }
}

async function phoneStep(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
  userId: number,
) {
  try {
    await ctx.reply(REGISTRATION_USER_SCENE.ENTER_PHONE, {
      parse_mode: "HTML",
      reply_markup: sendUserPhone(),
    });

    let phoneNumber: any = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:contact", {
        otherwise: (ctx) =>
          ctx.reply(REGISTRATION_USER_SCENE.ENTER_PHONE_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: sendUserPhone(),
          }),
      });

      if (!response.message?.contact) break;

      const contact = response.message.contact;
      const contactUserId = contact.user_id;

      if (contactUserId !== userId) {
        await ctx.reply(REGISTRATION_USER_SCENE.ENTERED_NOT_USER_PHONE, {
          parse_mode: "HTML",
          reply_markup: sendUserPhone(),
        });
        continue;
      }
      phoneNumber = contact.phone_number;
      break;
    }

    if (!phoneNumber) return;

    await ctx.reply(
      `${REGISTRATION_USER_SCENE.ENTERED_USER_PHONE} ${phoneNumber}`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );

    return phoneNumber;
  } catch (error) {
    logger.error("Error in registrationScene phoneStep: " + error);

    return null;
  }
}

async function photoStep(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
  userId: number,
  userPhone: any,
) {
  try {
    let skip_photo_verification = false;

    // const user_start_logs = await conversation.external(() =>
    //   getAllUserLogsByEvent({
    //     user_id: userId,
    //     event_type: "start",
    //   }),
    // );
    // if (user_start_logs.length > 0) {
    //   const event_data = user_start_logs[0].event_data;
    //   skip_photo_verification =
    //     event_data.referral_start.startsWith("campaign__") ||
    //     event_data.referral_start.length === 0;
    // }

    let result: RegistrationResponseText | null | "skip_photo" = null;
    let dataAll: any = {};

    if (skip_photo_verification) {
      const isHasSomeNumberUser = await getUser({ phone: userPhone });
      const isHasSomeIdUser = await getUser({ user_id: userId });
      const isBlockUser = await isUserInBlacklist({
        account_id: userId,
        phone: userPhone,
      });
      const isOperator = await getOperatorByIdPhoneOrTg({
        operator_id: userId,
        phone: userPhone,
      });

      // Если пользователь с таким номером телефона уже существует
      if (isHasSomeNumberUser) {
        result = "user_exist_number";
      } else if (isHasSomeIdUser) {
        result = "user_exist_id";
      } else if (isBlockUser || isOperator) {
        result = "user_is_block";
      } else {
        await addUser({
          userId: userId,
          userPhone: userPhone,
          skip_photo_verification: skip_photo_verification,
        });
        result = "skip_photo";
      }
    } else {
      await ctx.reply(REGISTRATION_USER_SCENE.VERIFY_BY_PHOTO, {
        reply_markup: WebAppKeyboard(userId, userPhone, "registration", "1"),
      });

      const message_web_app_data = await conversation.waitFor(
        "message:web_app_data",
        {
          otherwise: (ctx) =>
            ctx.reply(REGISTRATION_USER_SCENE.VERIFY_BY_PHOTO_OTHERWISE, {
              reply_markup: WebAppKeyboard(
                userId,
                userPhone,
                "registration",
                "1",
              ),
            }),
        },
      );
      if (message_web_app_data.message?.web_app_data) {
        const data = JSON.parse(message_web_app_data.message.web_app_data.data);
        dataAll = data;
        result = data.text;
      }
    }

    switch (result) {
      case "user_exist_number":
      case "user_exist_id":
      case "user_exist_face":
        await conversation.external(() =>
          addUserLogs({
            user_id: userId,
            event_type: "registration",
            step: "photo_user_exist_face",
            event_data: JSON.stringify(dataAll?.matches),
          }),
        );
        await ctx.reply(REGISTRATION_USER_SCENE.USER_EXIST, {
          reply_markup: IdentificationKeyboard(),
        });
        break;
      case "user_is_block":
        await ctx.reply(REGISTRATION_USER_SCENE.USER_IN_BLOCK, {
          reply_markup: { remove_keyboard: true },
        });
        break;
      case "success":
      case "skip_photo":
        await ctx.reply(REGISTRATION_USER_SCENE.SUCCESS, {
          reply_markup: AuthUserKeyboard(),
        });
        break;
      default:
        result = null;
    }

    return result;
  } catch (error) {
    logger.error("Error in registrationScene photoStep: " + error);

    return null;
  }
}
