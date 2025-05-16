import { Bot } from "grammy";
import { handleStartCommand } from "./callback/command_start";
import { ScenesOperator } from "../scenes";
import { handleChatidCommand } from "./callback/command_chatid";
import { handleTookSurvey } from "./callback/handle_took_survey";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { MyContext } from "../../bot-common/types/type";
import { getUserId } from "../../bot-common/utils/getUserId";
import { FinishSurveyKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import { newSurveysHandler } from "./callback/mess_new_surveys";
import { currentSurveysHandler } from "./callback/mess_current_surveys";
import { xls_parser } from "../../services/xls_parser";
import {
  getActiveSurvey,
  updateActiveSurvey,
} from "../../database/queries_kysely/survey_active";
import { getAllSurveyTasks } from "../../database/queries_kysely/survey_tasks";
import {
  cancelTakeSurveyByUser,
  getInfoAboutSurvey,
} from "../../database/services/surveyService";
import { cancelOperatorConversation } from "../utils/cancelOperatorConversation";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelOperatorConversation(ctx, true);
    await handleStartCommand(ctx);
  });
  bot.command("chatid", async (ctx) => {
    await cancelOperatorConversation(ctx, true);
    await handleChatidCommand(ctx);
  });
  bot.command("clean", (ctx) => cancelOperatorConversation(ctx));
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.RegistrationButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesOperator.RegisterScene);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.FinishSurveyButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesOperator.FinishSurveyScene);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.CancelSurveyButton,
      async (ctx: MyContext) => {
        const operatorId = await getUserId(ctx);
        if (!operatorId) return;

        const activeSurvey = await getActiveSurvey({ operatorId: operatorId });

        if (!activeSurvey) return;
        await cancelTakeSurveyByUser(
          activeSurvey.survey_active_id,
          activeSurvey.survey_id,
        );
        await ctx.reply("Опрос успешно отменен");
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      /NEW_SURVEY_ACTIVE\d+NEW_SURVEY_ACTIVE/,
      async (ctx: MyContext) => {
        const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
        if (!callbackData) {
          await ctx.answerCallbackQuery("Ошибка: данные не получены");
          return;
        }

        // Извлекаем survey_active_id (число) из callbackData
        const match = callbackData.match(
          /NEW_SURVEY_ACTIVE(\d+)NEW_SURVEY_ACTIVE/,
        );
        if (!match) {
          await ctx.answerCallbackQuery("Ошибка: неверный формат данных");
          return;
        }
        const surveyActiveId = parseInt(match[1], 10); // Получаем число из группы захвата

        const resultUpdate = await updateActiveSurvey(surveyActiveId, {
          reservationMinutes: null,
        });
        if (resultUpdate) {
          const newSurveyActive = await getActiveSurvey({
            surveyActiveId: surveyActiveId,
          });
          if (!newSurveyActive) return;

          let message = `Вы отметили, что пользователь `;
          const username = newSurveyActive.tg_account;
          if (username) {
            message += "@" + username + " написал.";
          }
          const codeword = newSurveyActive.code_word;
          if (codeword) {
            message += "с кодовым словом " + codeword + " написал.";
          }

          await ctx.reply(message);
        }
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      /CURRENT_SURVEY_ACTIVE\d+CURRENT_SURVEY_ACTIVE/,
      async (ctx: MyContext) => {
        const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
        if (!callbackData) {
          await ctx.answerCallbackQuery("Ошибка: данные не получены");
          return;
        }

        // Извлекаем survey_active_id (число) из callbackData
        const match = callbackData.match(
          /CURRENT_SURVEY_ACTIVE(\d+)CURRENT_SURVEY_ACTIVE/,
        );
        if (!match) {
          await ctx.answerCallbackQuery("Ошибка: неверный формат данных");
          return;
        }
        const surveyActiveId = parseInt(match[1], 10); // Получаем число из группы захвата

        const active_survey = await getActiveSurvey({
          surveyActiveId: surveyActiveId,
        });
        if (!active_survey) return;

        const surveyInfo = await getInfoAboutSurvey(active_survey.survey_id);
        if (!surveyInfo) return;

        const surveyActiveTasks = await getAllSurveyTasks(
          active_survey.survey_id,
        );

        let message = [
          `<b>📋 Опрос</b>`,
          //`<b>📋 Опрос: ${surveyActive.topic}</b>`,
          //`<b>Тип:</b> ${surveyActive.survey_type}`,
          //`<b>Описание:</b> ${surveyActive.description}`,
          `<b>Геолокация опроса:</b> ${surveyInfo.region_name}`,
          `<b>Геолокация пользователя:</b> ${active_survey.user_location}`,
          ``, // Empty line for spacing
        ].join("\n");

        message += "\n\n<b>📝 Задания:</b>\n";
        surveyActiveTasks.forEach((task, index) => {
          message += `<b>${index + 1}:</b> ${task.description.replaceAll("/n", "\n")}\n`;
        });
        await ctx.reply(`${message}`, { parse_mode: "HTML" });

        await ctx.reply("После окончания опроса нажми на кнопку завершения.", {
          reply_markup: FinishSurveyKeyboard(),
        });
      },
    );

  bot
    .chatType("channel")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.TookButton,
      async (ctx: MyContext) => {
        await handleTookSurvey(ctx, bot);
      },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.NewSurveys) {
      await newSurveysHandler(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.CurrentSurveys) {
      await currentSurveysHandler(ctx);
    }
  });

  bot.on("message:document", async (ctx) => {
    await xls_parser(ctx, bot);
  });
}
//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {}
