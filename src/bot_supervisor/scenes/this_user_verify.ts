import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { getSimilarUsersPhotoByUserId } from "../../database/services/verifyUsers";
import { HANDLER_GET_USER_LOGS } from "../../bot-common/constants/handler_messages";
import logger from "../../lib/logger";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import {
  getUser,
  updateUserByUserId,
} from "../../database/queries_kysely/users";
import { yesOrNotStep } from "../../bot-common/scenes/common_step/yes_or_not";
import {
  addUserInBlacklist,
  isUserInBlacklist,
} from "../../database/queries_kysely/blacklist_users";

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
    const user = await conversation.external(() =>
      getUser({ user_id: user_id }),
    );
    if (!user) {
      return ctx.reply("Пользователь не зарегистрирован");
    }

    const photo_data = await conversation.external(() =>
      getSimilarUsersPhotoByUserId(user_id),
    );
    const usersPhotoGroup: any[] = [];
    const similarUsersPhotoGroups: { [key: number]: any[] } = {};

    // Собираем фотографии основного пользователя
    for (const element of photo_data.users_photo) {
      if (element.file_id_supervisor) {
        usersPhotoGroup.push({
          type: "photo",
          media: element.file_id_supervisor,
        });
      }
    }

    // Собираем фотографии других пользователей, группируя по user_id
    for (const one_user of photo_data.similar_users_photo) {
      for (const element of one_user) {
        if (element.file_id_supervisor) {
          if (!similarUsersPhotoGroups[element.user_id]) {
            similarUsersPhotoGroups[element.user_id] = [];
          }
          similarUsersPhotoGroups[element.user_id].push({
            type: "photo",
            media: element.file_id_supervisor,
          });
        }
      }
    }

    // Отправляем фотографии основного пользователя
    if (usersPhotoGroup.length > 0) {
      await ctx.reply(`Фотографии при регистрации: ${user_id} ⬇️⬇️⬇️`);
      const chunkSize = 10;
      for (let i = 0; i < usersPhotoGroup.length; i += chunkSize) {
        const chunk = usersPhotoGroup.slice(i, i + chunkSize);
        await ctx.replyWithMediaGroup(chunk);
      }
    } else {
      await ctx.reply("Фотографии не найдены");
    }

    // Отправляем фотографии других пользователей, сгруппированные по user_id
    for (const userId in similarUsersPhotoGroups) {
      const group = similarUsersPhotoGroups[userId];
      if (group.length > 0) {
        await ctx.reply(`Фотографии похожего пользователя: ${userId} ⬇️⬇️⬇️`);
        const chunkSize = 10;
        for (let i = 0; i < group.length; i += chunkSize) {
          const chunk = group.slice(i, i + chunkSize);
          await ctx.replyWithMediaGroup(chunk);
        }
      } else {
        await ctx.reply(`Фотографии для пользователя ${userId} не найдены`);
      }
    }
    let isBlock = await conversation.external(() =>
      isUserInBlacklist({ account_id: user_id }),
    );
    if (isBlock) {
      await ctx.reply("Пользователь уже заблокирован");
    } else {
      const isUnique = await yesOrNotStep(conversation, ctx, {
        question: `Заблокировать пользователя ${user_id}?`,
      });
      if (isUnique === null) {
        throw new Error("isUnique error");
      }
      if (isUnique === BUTTONS_KEYBOARD.YesButton) {
        await conversation.external(() =>
          addUserInBlacklist({
            account_id: user_id,
            phone: user.phone,
            reason: "Не прошел верификацию руководителем",
          }),
        );
        isBlock = true;
      } else {
        const isUpdate = await conversation.external(() =>
          updateUserByUserId(user_id, {
            is_verification: true,
          }),
        );
        if (!isUpdate) {
          throw new Error("isUpdate error");
        }
        return ctx.reply("Пользователь отмечен как проверенный", {
          reply_markup: AuthSupervisorKeyboard(),
        });
      }
    }

    if (isBlock) {
      if (photo_data.similar_users_photo.length > 0) {
        const isWillBlock = await yesOrNotStep(conversation, ctx, {
          question: "Заблокировать указанных выше похожих пользователей?",
        });

        if (isWillBlock === null) {
          throw new Error("isWillBlock error");
        }
        if (isWillBlock === BUTTONS_KEYBOARD.YesButton) {
          const samePeopleArr = Object.entries(similarUsersPhotoGroups);
          for (const element of samePeopleArr) {
            const user = await conversation.external(() =>
              getUser({ user_id: Number(element[0]) }),
            );

            if (element[1].length > 0) {
              await conversation.external(() =>
                addUserInBlacklist({
                  account_id: Number(element[0]),
                  phone: user?.phone ?? null,
                  reason: `Похож на пользователя ${user_id}`,
                }),
              );
            }
          }
          return ctx.reply("Готово", {
            reply_markup: AuthSupervisorKeyboard(),
          });
        } else {
          await ctx.reply("Ок не будем", {
            reply_markup: AuthSupervisorKeyboard(),
          });
          return;
        }
      }
    }
  } catch (error) {
    logger.error("Ошибка в thisUserVerify: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
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
