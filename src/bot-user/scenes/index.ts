import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { registrationUserScene } from "./registration_user";
import { identificationScene } from "./identification";
import { inviteScene } from "./invite";
import { surveyScene } from "./survey";
import { withdrawalScene } from "./withdrawal";
import { MyContext } from "../../bot-common/types/type";

export enum ScenesUser {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  IdentificationScene = "IdentificationScene", // eslint-disable-line no-unused-vars
  SurveyScene = "SurveyScene", // eslint-disable-line no-unused-vars
  InviteScene = "InviteScene", // eslint-disable-line no-unused-vars
  WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
}
export type ScenesUserType = (typeof ScenesUser)[keyof typeof ScenesUser];
export function registerScenes(bot: Bot<MyContext>): void {
  // Регистрируем сцену
  bot.use(
    createConversation(registrationUserScene, { id: ScenesUser.RegisterScene }),
  );
  bot.use(
    createConversation(identificationScene, {
      id: ScenesUser.IdentificationScene,
    }),
  );
  bot.use(createConversation(inviteScene, { id: ScenesUser.InviteScene }));
  bot.use(createConversation(surveyScene, { id: ScenesUser.SurveyScene }));
  bot.use(
    createConversation(withdrawalScene, { id: ScenesUser.WithdrawalScene }),
  );
}
