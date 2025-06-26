import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { MyContext } from "../../bot-common/types/type";
import { checkSurveyScene } from "./audit_survey_scene";
import { withdrawalScene } from "../../bot-common/scenes/withdrawal";

import { AuthAuditorKeyboard } from "../../bot-common/keyboards/keyboard";
import { simpleRegistrationScene } from "../../bot-common/scenes/simpleRegistration";
import { linkWelcomeAuditor } from "../../config/env";

export enum ScenesAuditor {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  CheckSurveyScene = "CheckSurveyScene", // eslint-disable-line no-unused-vars
  WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
}

export function registerScenes(bot: Bot<MyContext>): void {
  bot.use(
    createConversation(
      (a, b) =>
        simpleRegistrationScene(
          a,
          b,
          "auditor",
          AuthAuditorKeyboard(),
          linkWelcomeAuditor,
        ),
      {
        id: ScenesAuditor.RegisterScene,
      },
    ),
  );

  bot.use(
    createConversation((a, b) => checkSurveyScene(a, b), {
      id: ScenesAuditor.CheckSurveyScene,
    }),
  );

  bot.use(
    createConversation(
      (a, b) => withdrawalScene(a, b, "auditor", AuthAuditorKeyboard()),
      {
        id: ScenesAuditor.WithdrawalScene,
      },
    ),
  );
}
