import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { registrationOperatorScene } from "./registration_operator";
import { finishSurveyScene } from "./finish_survey";
import { MyContext } from "../../bot-common/types/type";
import { withdrawalScene } from "./withdrawal";

export enum ScenesOperator {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  FinishSurveyScene = "FinishSurveyScene", // eslint-disable-line no-unused-vars
  WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
}

export type ScenesOperatorType =
  (typeof ScenesOperator)[keyof typeof ScenesOperator];

export function registerScenes(bot: Bot<MyContext>): void {
  // Регистрируем сцену
  bot.use(
    createConversation(registrationOperatorScene, {
      id: ScenesOperator.RegisterScene,
    }),
  );
  bot.use(
    createConversation(finishSurveyScene, {
      id: ScenesOperator.FinishSurveyScene,
    }),
  );
  bot.use(
    createConversation(withdrawalScene, { id: ScenesOperator.WithdrawalScene }),
  );
}
