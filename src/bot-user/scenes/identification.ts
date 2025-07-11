import logger from "../../lib/logger";
import { getUserId, returnUserId } from "../../bot-common/utils/getUserId";
import { RESPONSES } from "../../bot-common/constants/responses";
import {
  IdentificationInlineKeyboard,
  RegistrationInlineKeyboard,
} from "../../bot-common/keyboards/inlineKeyboard";
import {
  AuthUserKeyboard,
  WebAppPhotoKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { IDENTIFICATION_USER_SCENE } from "../../bot-common/constants/scenes";
import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import {
  getUser,
  updateUserByUserId,
} from "../../database/queries_kysely/users";

export async function identificationScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<void> {
  try {
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;

    const user = await conversation.external(() =>
      getUser({ user_id: userId }),
    );
    if (!user) {
      await ctx.reply(IDENTIFICATION_USER_SCENE.USER_NOT_EXIST, {
        reply_markup: RegistrationInlineKeyboard(),
      });
      return;
    }
    if (user.skip_photo_verification) {
      await ctx.reply(IDENTIFICATION_USER_SCENE.SUCCESS_SKIP_PHOTO, {
        reply_markup: AuthUserKeyboard(),
      });
      return;
    }

    const response = await photoStep(conversation, ctx, userId);
    if (!response) {
      await ctx.reply(IDENTIFICATION_USER_SCENE.SOME_ERROR, {
        reply_markup: IdentificationInlineKeyboard(),
      });
    }
    return;
  } catch (error) {
    const userId = await returnUserId(ctx);

    logger.error(userId + ": Error in identificationScene: " + error);
    await ctx.reply(RESPONSES.SOME_ERROR);
    return;
  }
}

export async function photoStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  userId: number,
) {
  try {
    let result = null;

    await ctx.reply(IDENTIFICATION_USER_SCENE.VERIFY_BY_PHOTO, {
      reply_markup: WebAppPhotoKeyboard(userId, "", "identification", "1"),
    });

    const message_web_app_data = await conversation.waitFor(
      "message:web_app_data",
      {
        otherwise: (ctx) =>
          ctx.reply(IDENTIFICATION_USER_SCENE.VERIFY_BY_PHOTO_OTHERWISE, {
            reply_markup: WebAppPhotoKeyboard(
              userId,
              "",
              "identification",
              "1",
            ),
          }),
      },
    );

    if (message_web_app_data.message?.web_app_data) {
      const data = await JSON.parse(
        message_web_app_data.message.web_app_data.data,
      );
      result = data.text;
      switch (result) {
        case "user_is_block":
          {
            await ctx.reply(IDENTIFICATION_USER_SCENE.USER_IN_BLOCK, {
              reply_markup: { remove_keyboard: true },
            });
          }
          break;
        case "similarity_not_confirmed":
          {
            await ctx.reply(IDENTIFICATION_USER_SCENE.NOT_SIMILAR, {
              reply_markup: { remove_keyboard: true },
            });
          }
          break;
        case "success":
          {
            await ctx.reply(IDENTIFICATION_USER_SCENE.SUCCESS, {
              reply_markup: AuthUserKeyboard(),
            });
            await updateUserByUserId(userId, { last_init: "update" });
          }
          break;
        default: {
          result = null;
          await ctx.reply(IDENTIFICATION_USER_SCENE.SOME_ERROR, {
            reply_markup: IdentificationInlineKeyboard(),
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
