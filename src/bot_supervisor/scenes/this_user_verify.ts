import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { getVerifyPhotosByUserId } from "../../database/services/verifyUsers";
import { HANDLER_GET_USER_LOGS } from "../../bot-common/constants/handler_messages";
import logger from "../../lib/logger";

export const thisUserVerify = async (
  conversation: MyConversation,
  ctx: MyConversationContext,
) => {
  try {
    const user_id = await enterUserIdStep(conversation, ctx);
    if (!user_id) {
      await ctx.reply("Произошла ошибка", {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }
    const all = await getVerifyPhotosByUserId(user_id);
    if (!all.isRegister) {
      return ctx.reply("Пользователь не зарегистрирован");
    }
    const mediaGroup: any[] = [];
    const sameMediaGroups: { [key: number]: any[] } = {};
    for (const el of all.photo_users) {
      if (el.file_id_supervisor) {
        mediaGroup.push({
          type: "photo",
          media: el.file_id_supervisor,
          caption: `Фотографии при регистрации: ${user_id}`,
        });
      }
    }

    for (const el2 of all.same_users_photo) {
      for (const el of el2) {
        if (el.file_id_supervisor) {
          if (!sameMediaGroups[el.user_id]) {
            sameMediaGroups[el.user_id] = [];
          }
          sameMediaGroups[el.user_id].push({
            type: "photo",
            media: el.file_id_supervisor,
            caption: `Фотографии другого пользователя ${el.user_id}`,
          });
        }
      }
    }
    // Если есть фотографии, отправляем их пулом
    if (mediaGroup.length > 0) {
      // Telegram API ограничивает mediaGroup до 10 элементов за раз
      const chunkSize = 10;
      for (let i = 0; i < mediaGroup.length; i += chunkSize) {
        const chunk = mediaGroup.slice(i, i + chunkSize);
        await ctx.replyWithMediaGroup(chunk);
      }
    } else {
      await ctx.reply("Фотографии не найдены");
    }
    // Если есть фотографии, отправляем их пулом
    for (const userId in sameMediaGroups) {
      const group = sameMediaGroups[userId];
      if (group.length > 0) {
        const chunkSize = 10;
        for (let i = 0; i < group.length; i += chunkSize) {
          const chunk = group.slice(i, i + chunkSize);
          await ctx.replyWithMediaGroup(chunk);
        }
      } else {
        await ctx.reply(`Фотографии для пользователя ${userId} не найдены`);
      }
    }
  } catch (error) {
    logger.error("Error in handleCQThisUserVerify: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR);
  }
};

async function enterUserIdStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<number | null> {
  try {
    await ctx.reply("Введите ID пользователя");

    let result: any = null;

    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) => ctx.reply("Пожалуйста, введите ID пользователя"),
      });
      result = Number(response.message?.text.trim() ?? "");
      if (isNaN(result)) {
        await ctx.reply("Вы ввели невалидный ID");
        continue;
      }

      break;
    }

    return result;
  } catch (error) {
    logger.error(error);

    return null;
  }
}
