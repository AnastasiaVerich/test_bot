import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { finishSurveyScene } from "./finish_survey";
import { MyContext } from "../../bot-common/types/type";

import { withdrawalScene } from "../../bot-common/scenes/withdrawal";
import { AuthOperatorKeyboard } from "../../bot-common/keyboards/keyboard";
import { simpleRegistrationScene } from "../../bot-common/scenes/simpleRegistration";
import { linkWelcomeOperator } from "../../config/env";
import { recheckSurveyScene } from "./recheck_survey";

export enum ScenesOperator {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  FinishSurveyScene = "FinishSurveyScene", // eslint-disable-line no-unused-vars
  WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
  RecheckSurvey = "RecheckSurvey", // eslint-disable-line no-unused-vars
}

export function registerScenes(bot: Bot<MyContext>): void {
  // Регистрируем сцену
  bot.use(
    createConversation(
      (a, b) =>
        simpleRegistrationScene(
          a,
          b,
          "operator",
          AuthOperatorKeyboard(),
          linkWelcomeOperator,
        ),
      {
        id: ScenesOperator.RegisterScene,
      },
    ),
  );
  bot.use(
    createConversation((a, b, arg) => finishSurveyScene(a, b, bot, arg), {
      id: ScenesOperator.FinishSurveyScene,
    }),
  );
  bot.use(
    createConversation(recheckSurveyScene, {
      id: ScenesOperator.RecheckSurvey,
    }),
  );
  bot.use(
    createConversation(
      (a, b) => withdrawalScene(a, b, "operator", AuthOperatorKeyboard()),
      { id: ScenesOperator.WithdrawalScene },
    ),
  );
}
