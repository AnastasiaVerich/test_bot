import {Bot} from "grammy";
import {createConversation} from "@grammyjs/conversations";
import {registrationScene} from "./registration";
import {MyContext} from "../types/type";
import {identificationScene} from "./identificationScene";
import {surveyScene} from "./surveyScene";
import {inviteScene} from "./inviteScene";
import {withdrawalScene} from "./withdrawalScene";

export enum Scenes {
    RegisterScene = "RegisterScene",
    IdentificationScene = "IdentificationScene",
    SurveyScene = "SurveyScene",
    InviteScene = "InviteScene",
    WithdrawalScene = "WithdrawalScene",
}


export function registerScenes(bot: Bot<MyContext>) {
    // Регистрируем сцену
    bot.use(createConversation(registrationScene, Scenes.RegisterScene));
    bot.use(createConversation(identificationScene, Scenes.IdentificationScene));
    bot.use(createConversation(surveyScene, Scenes.SurveyScene));
    bot.use(createConversation(inviteScene, Scenes.InviteScene));
    bot.use(createConversation(withdrawalScene, Scenes.WithdrawalScene));

}
