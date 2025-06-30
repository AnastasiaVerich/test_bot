import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { getSimilarUsersPhotoByUserId } from "../../database/services/verifyUsers";
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
import { VERIFY_USERS_SCENE } from "../../bot-common/constants/scenes";

export const thisUserVerify = async (
  conversation: MyConversation,
  ctx: MyConversationContext,
) => {
  try {
    const user_id = await enterUserIdStep(conversation, ctx);
    if (!user_id) {
      return ctx.reply(VERIFY_USERS_SCENE.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
    const user = await conversation.external(() =>
      getUser({ user_id: user_id }),
    );
    if (!user) {
      return ctx.reply(VERIFY_USERS_SCENE.USER_NOT_REGISTER, {
        reply_markup: AuthSupervisorKeyboard(),
      });
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
      await ctx.reply(
        VERIFY_USERS_SCENE.USERS_PHOTO.replace("{user_id}", user_id.toString()),
      );
      const chunkSize = 10;
      for (let i = 0; i < usersPhotoGroup.length; i += chunkSize) {
        const chunk = usersPhotoGroup.slice(i, i + chunkSize);
        await ctx.replyWithMediaGroup(chunk);
      }
    } else {
      return ctx.reply(VERIFY_USERS_SCENE.PHOTO_NOT_FOUND, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }

    // Отправляем фотографии других пользователей, сгруппированные по user_id
    for (const similarUserId in similarUsersPhotoGroups) {
      const group = similarUsersPhotoGroups[similarUserId];
      if (group.length > 0) {
        await ctx.reply(
          VERIFY_USERS_SCENE.SIMILAR_USERS_PHOTO.replace(
            "{user_id}",
            similarUserId,
          ),
        );
        const chunkSize = 10;
        for (let i = 0; i < group.length; i += chunkSize) {
          const chunk = group.slice(i, i + chunkSize);
          await ctx.replyWithMediaGroup(chunk);
        }
      } else {
        await ctx.reply(
          VERIFY_USERS_SCENE.SIMILAR_USERS_PHOTO_NOT_FOUND.replace(
            "{user_id}",
            similarUserId.toString,
          ),
        );
      }
    }
    let isBlock = await conversation.external(() =>
      isUserInBlacklist({ account_id: user_id }),
    );
    if (isBlock) {
      await ctx.reply(VERIFY_USERS_SCENE.USER_IS_BLOCK);
    } else {
      const isUnique = await yesOrNotStep(conversation, ctx, {
        question: VERIFY_USERS_SCENE.ASK_BLOCK.replace(
          "{user_id}",
          user_id.toString(),
        ),
      });
      if (isUnique === null) {
        throw new Error("isUnique error");
      }
      if (isUnique === BUTTONS_KEYBOARD.YesButton) {
        await conversation.external(() =>
          addUserInBlacklist({
            account_id: user_id,
            phone: user.phone,
            reason: "Не прошел проверку руководителем",
          }),
        );
        isBlock = true;
      }
    }

    if (isBlock) {
      if (photo_data.similar_users_photo.length > 0) {
        const isWillBlock = await yesOrNotStep(conversation, ctx, {
          question: VERIFY_USERS_SCENE.ASK_BLOCK_SIMILAR_USERS,
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
          return ctx.reply(VERIFY_USERS_SCENE.SUCCESS_BLOCK);
        }
      }
    }

    const isCheck = await yesOrNotStep(conversation, ctx, {
      question: VERIFY_USERS_SCENE.ASK_USER_CHECK.replace(
        "{user_id}",
        user_id.toString(),
      ),
    });
    if (isCheck === null) {
      throw new Error("isUnique error");
    }
    if (isCheck === BUTTONS_KEYBOARD.YesButton) {
      const isUpdate = await conversation.external(() =>
        updateUserByUserId(user_id, {
          is_supervisor_check: true,
        }),
      );
      if (!isUpdate) {
        throw new Error("isUpdate error");
      }
      await ctx.reply(VERIFY_USERS_SCENE.CHECK_SUCCESS, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }

    return ctx.reply(VERIFY_USERS_SCENE.FINISH, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  } catch (error) {
    logger.error("Ошибка в thisUserVerify: " + error);
    await ctx.reply(VERIFY_USERS_SCENE.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
};

async function enterUserIdStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<number | null> {
  try {
    await ctx.reply(VERIFY_USERS_SCENE.ENTER_ID);

    let result: any = null;

    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) => ctx.reply(VERIFY_USERS_SCENE.ENTER_ID_OTHERWISE),
      });
      result = Number(response.message?.text.trim() ?? "");
      if (isNaN(result)) {
        await ctx.reply(VERIFY_USERS_SCENE.ENTER_ID_NOT_VALID);
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
