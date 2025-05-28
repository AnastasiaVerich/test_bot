import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import {
  ConfirmCancelButtons,
  AuthSupervisorKeyboard,
} from "../../bot-common/keyboards/keyboard";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { ADD_NEW_OPERATORS_SCENE } from "../../bot-common/constants/scenes";
import {
  addOperator,
  getOperatorByIdPhoneOrTg,
} from "../../database/queries_kysely/operators";

export async function addNewOperatorsScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  try {
    const name = await enterUserNameStep(conversation, ctx);
    if (!name) {
      await ctx.reply(ADD_NEW_OPERATORS_SCENE.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }

    const resultConfirm = await stepConfirm(conversation, ctx, name);

    if (!resultConfirm) {
      await ctx.reply(ADD_NEW_OPERATORS_SCENE.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });

      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      // Добавляем платеж в список ожидающих

      const isAdd = await conversation.external(() => addOperator(name));
      if (!isAdd) {
        await ctx.reply(ADD_NEW_OPERATORS_SCENE.SOME_ERROR, {
          reply_markup: AuthSupervisorKeyboard(),
        });
        return;
      }
      await ctx.reply(ADD_NEW_OPERATORS_SCENE.SUCCESS, {
        parse_mode: "HTML",
        reply_markup: AuthSupervisorKeyboard(),
      });
    } else {
      return ctx.reply(ADD_NEW_OPERATORS_SCENE.CANCELLED, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in addNewOperatorsScene: " + error);
    await ctx.reply(ADD_NEW_OPERATORS_SCENE.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
}

async function enterUserNameStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<string | null> {
  try {
    await ctx.reply(ADD_NEW_OPERATORS_SCENE.ENTER_USERNAME);

    let result: any = null;

    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(ADD_NEW_OPERATORS_SCENE.ENTER_USERNAME_OTHERWISE),
      });
      result = response.message?.text.trim() ?? "";
      const isValidLink = /^[a-zA-Z0-9_]+$/.test(result);
      if (!isValidLink || result.length <= 4) {
        await ctx.reply(ADD_NEW_OPERATORS_SCENE.ENTER_USERNAME_INVALID);
        continue;
      }
      const isOperatorExist = await conversation.external(() =>
        getOperatorByIdPhoneOrTg({
          tg_account: result,
        }),
      );
      if (isOperatorExist) {
        await ctx.reply(ADD_NEW_OPERATORS_SCENE.ENTER_USERNAME_EXIST);
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

async function stepConfirm(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
  name: string,
) {
  try {
    await ctx.reply(
      ADD_NEW_OPERATORS_SCENE.CONFIRMATION.replace("{operator_name}", name),
      {
        parse_mode: "HTML",
        reply_markup: ConfirmCancelButtons(),
      },
    );

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(ADD_NEW_OPERATORS_SCENE.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelButtons(),
            }),
        },
      );

      if (!response.message?.text) break;

      result = response.message?.text;
      break;
    }

    if (!result) return null;
    // Сбрасываем сессию после завершения

    return result;
  } catch (error) {
    return null;
  }
}
