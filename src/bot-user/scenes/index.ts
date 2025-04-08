import { Bot } from "grammy";
import { createConversation } from "@grammyjs/conversations";
import { registrationScene } from "./registration/registration";
import { MyContext } from "../types/type";
import { identificationScene } from "./identificationScene/identificationScene";
import { surveyScene } from "./surveyScene/surveyScene";
import { inviteScene } from "./inviteScene/inviteScene";
import { withdrawalScene } from "./withdrawalScene/withdrawalScene";

export enum Scenes {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
  IdentificationScene = "IdentificationScene", // eslint-disable-line no-unused-vars
  SurveyScene = "SurveyScene", // eslint-disable-line no-unused-vars
  InviteScene = "InviteScene", // eslint-disable-line no-unused-vars
  WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
}

export function registerScenes(bot: Bot<MyContext>): void {
  // Регистрируем сцену
  bot.use(createConversation(registrationScene, Scenes.RegisterScene));
  bot.use(createConversation(identificationScene, Scenes.IdentificationScene));
  bot.use(createConversation(surveyScene, Scenes.SurveyScene));
  bot.use(createConversation(inviteScene, Scenes.InviteScene));
  bot.use(createConversation(withdrawalScene, Scenes.WithdrawalScene));
}
