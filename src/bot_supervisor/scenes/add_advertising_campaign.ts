import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import {
  ConfirmCancelKeyboard,
  AuthSupervisorKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { ADD_ADV_CAMPAIGN_SCENE } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import {
  addAdvertisingCampaign,
  getAdvertisingCampaign,
} from "../../database/queries_kysely/advertising_campaigns";
import { ReferralService } from "../../services/referralService";
import { bot_user__name } from "../../config/env";

export async function addAdvertisingCampaignScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  try {
    const name = await enterNameStep(conversation, ctx);
    if (!name) {
      await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }

    const referralService = new ReferralService(bot_user__name);

    const link: string = referralService.generateReferralLink(
      `campaign__${name}`,
    );

    const resultConfirm = await stepConfirm(conversation, ctx, name);

    if (!resultConfirm) {
      await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });

      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      // Добавляем платеж в список ожидающих

      const isAdd = await conversation.external(() =>
        addAdvertisingCampaign({
          name: name,
          referral_link: link,
        }),
      );
      if (!isAdd) {
        await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.SOME_ERROR, {
          reply_markup: AuthSupervisorKeyboard(),
        });
        return;
      }
      await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.SUCCESS + `<code>${link}</code>`, {
        parse_mode: "HTML",
        reply_markup: AuthSupervisorKeyboard(),
      });
    } else {
      return ctx.reply(ADD_ADV_CAMPAIGN_SCENE.CANCELLED, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in addAdvertisingCampaignScene: " + error);
    await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
}

async function enterNameStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<string | null> {
  try {
    await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.ENTER_NAME);

    let result: any = null;

    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(ADD_ADV_CAMPAIGN_SCENE.ENTER_NAME_OTHERWISE),
      });
      result = response.message?.text.trim() ?? "";
      const isValidLink = /^[a-zA-Z0-9_]+$/.test(result);
      if (!isValidLink || result.length === 0) {
        await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.ENTER_NAME_INVALID);
        continue;
      }
      const theSameNameCampaign = await conversation.external(() =>
        getAdvertisingCampaign({
          name: result,
        }),
      );
      if (theSameNameCampaign) {
        await ctx.reply(ADD_ADV_CAMPAIGN_SCENE.ENTER_NAME_EXIST);
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
      ADD_ADV_CAMPAIGN_SCENE.CONFIRMATION.replace("{campaign_name}", name),
      {
        parse_mode: "HTML",
        reply_markup: ConfirmCancelKeyboard(),
      },
    );

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(ADD_ADV_CAMPAIGN_SCENE.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelKeyboard(),
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
