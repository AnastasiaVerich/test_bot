import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { MyContext } from "../../bot-common/types/type";
import { checkSurveyScene } from "./check_survey_scene";
import { ScenesOperator } from "../../bot-operator/scenes";
import { registrationAuditorScene } from "./registration_auditor";

export enum ScenesAuditor {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  CheckSurveyScene = "CheckSurveyScene", // eslint-disable-line no-unused-vars
}

export type ScenesAuditorType =
  (typeof ScenesAuditor)[keyof typeof ScenesAuditor];

export function registerScenes(bot: Bot<MyContext>): void {
  bot.use(
    createConversation(registrationAuditorScene, {
      id: ScenesOperator.RegisterScene,
    }),
  );

  bot.use(
    createConversation(checkSurveyScene, {
      id: ScenesAuditor.CheckSurveyScene,
    }),
  );
}
