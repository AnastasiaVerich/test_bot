import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { MyContext } from "../../bot-common/types/type";
import { checkSurveyScene } from "./check_survey_scene";
import { registrationAuditorScene } from "./registration_auditor";
import { withdrawalScene } from "./withdrawal";

export enum ScenesAuditor {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  CheckSurveyScene = "CheckSurveyScene", // eslint-disable-line no-unused-vars
  WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
}

export type ScenesAuditorType =
  (typeof ScenesAuditor)[keyof typeof ScenesAuditor];

export function registerScenes(bot: Bot<MyContext>): void {
  bot.use(
    createConversation(registrationAuditorScene, {
      id: ScenesAuditor.RegisterScene,
    }),
  );

  bot.use(
    createConversation(checkSurveyScene, {
      id: ScenesAuditor.CheckSurveyScene,
    }),
  );

  bot.use(
    createConversation(withdrawalScene, { id: ScenesAuditor.WithdrawalScene }),
  );
}
