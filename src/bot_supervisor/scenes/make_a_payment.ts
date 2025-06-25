import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import {
  AuthSupervisorKeyboard,
  YesNoKeyboard,
} from "../../bot-common/keyboards/keyboard";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { MAKE_A_PAYMENT_SCENES } from "../../bot-common/constants/scenes";
import { getPendingPaymentByUserId } from "../../database/queries_kysely/pending_payments";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { paymentIsCompleted } from "../../database/services/paymentService";

export async function makeAPayment(
  conversation: MyConversation,
  ctx: MyConversationContext,
  arg: { state: { user_id: number } },
) {
  try {
    let user_id = arg.state.user_id;
    const pendingPayment = await getPendingPaymentByUserId(user_id);
    if (!pendingPayment) {
      await ctx.reply(MAKE_A_PAYMENT_SCENES.NO_PENDING_PAYMENT, {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }
    await ctx.reply(
      MAKE_A_PAYMENT_SCENES.INFO.replace(
        "{amount}",
        pendingPayment.amount.toString(),
      ).replace("{address}", pendingPayment.wallet),
      {
        parse_mode: "HTML",
      },
    );

    const resultConfirm = await stepConfirm(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(MAKE_A_PAYMENT_SCENES.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.YesButton) {
      const res = await paymentIsCompleted(pendingPayment);
      if (res === "ok") {
        return ctx.reply(MAKE_A_PAYMENT_SCENES.SUCCESS, {
          reply_markup: AuthSupervisorKeyboard(),
        });
      } else {
        await ctx.reply(MAKE_A_PAYMENT_SCENES.SOME_ERROR, {
          reply_markup: AuthSupervisorKeyboard(),
        });
      }
    } else {
      return ctx.reply(MAKE_A_PAYMENT_SCENES.CANCELLED, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in makeAPayment: " + error);
    await ctx.reply(MAKE_A_PAYMENT_SCENES.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
}

async function stepConfirm(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
) {
  try {
    await ctx.reply(MAKE_A_PAYMENT_SCENES.CONFIRMATION, {
      parse_mode: "HTML",
      reply_markup: YesNoKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.YesButton, BUTTONS_KEYBOARD.NoButton],
        {
          otherwise: (ctx) =>
            ctx.reply(MAKE_A_PAYMENT_SCENES.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: YesNoKeyboard(),
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
    logger.error("Error in makeAPayment in stepConfirm", error);
    return null;
  }
}
