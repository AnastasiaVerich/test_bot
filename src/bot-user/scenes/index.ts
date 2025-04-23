import {Bot} from "grammy";
import {createConversation} from "@grammyjs/conversations";
import {registrationScene} from "./registration/registration";
import {MyContext} from "../types/type";
import {identificationScene} from "./identificationScene/identificationScene";
import {inviteScene} from "./inviteScene/inviteScene";
import {surveyScene} from "./surveyScene/surveyScene";
import {withdrawalScene} from "./withdrawalScene/withdrawalScene";

export enum Scenes {
    RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
    IdentificationScene = "IdentificationScene", // eslint-disable-line no-unused-vars
    SurveyScene = "SurveyScene", // eslint-disable-line no-unused-vars
    InviteScene = "InviteScene", // eslint-disable-line no-unused-vars
    WithdrawalScene = "WithdrawalScene", // eslint-disable-line no-unused-vars
}

export function registerScenes(bot: Bot<MyContext>): void {
    // Регистрируем сцену
    bot.use(createConversation(registrationScene, {id: Scenes.RegisterScene}));
    bot.use(createConversation(identificationScene, {id: Scenes.IdentificationScene}));
    bot.use(createConversation(inviteScene, {id: Scenes.InviteScene}));
    bot.use(createConversation(surveyScene, {id: Scenes.SurveyScene}));
    bot.use(createConversation(withdrawalScene, {id: Scenes.WithdrawalScene}));
}
