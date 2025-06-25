import { Keyboard } from "grammy";
import logger from "../../lib/logger";
import {
  OffCancelKeyboard,
  OnCancelKeyboard,
  AuthSupervisorKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { SWITCH_PAYMENT_TYPE_SCENES } from "../../bot-common/constants/scenes";
import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import {
  getCommonVariableByLabel,
  upsertCommonVariable,
} from "../../database/queries_kysely/common_variables";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";

export async function switchPaymentType(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  try {
    const autoPayInfo = await getCommonVariableByLabel("auto_payments_enabled");
    if (!autoPayInfo) {
      await ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }

    let question = SWITCH_PAYMENT_TYPE_SCENES.STATE_NOW;
    let keyboard = OnCancelKeyboard();
    if (autoPayInfo.value === "ON") {
      question = question
        .replace("{status}", "включено")
        .replace("{action}", "отключить");
      keyboard = OffCancelKeyboard();
    } else {
      question = question
        .replace("{status}", "отключено")
        .replace("{action}", "включить");
      keyboard = OnCancelKeyboard();
    }

    const resultKeyboard = await onOffStep(
      conversation,
      ctx,
      keyboard,
      question,
    );
    if (resultKeyboard === null) {
      await ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
    if (resultKeyboard === BUTTONS_KEYBOARD.OnButton) {
      await upsertCommonVariable("auto_payments_enabled", "ON");
      return ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.SUCCESS_ON, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    } else if (resultKeyboard === BUTTONS_KEYBOARD.OffButton) {
      await upsertCommonVariable("auto_payments_enabled", "OFF");
      return ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.SUCCESS_OFF, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    } else {
      return ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.CANCELLED, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in switchPaymentType: " + error);
    await ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
}

async function onOffStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  keyboard: Keyboard,
  question: string,
) {
  try {
    await ctx.reply(question, {
      parse_mode: "HTML",
      reply_markup: keyboard,
    });

    let result: string | null = null;
    while (true) {
      const response = await conversation.waitForHears(
        [
          BUTTONS_KEYBOARD.OnButton,
          BUTTONS_KEYBOARD.OffButton,
          BUTTONS_KEYBOARD.CancelButton,
        ],
        {
          otherwise: (ctx) =>
            ctx.reply(SWITCH_PAYMENT_TYPE_SCENES.ENTER_ON_OR_OFF_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: keyboard,
            }),
        },
      );

      if (!response.message?.text) break;

      result = response.message?.text;
      break;
    }

    if (!result) return null;
    return result;
  } catch (error) {
    logger.error("Error in onOffStep", error);
    return null;
  }
}
