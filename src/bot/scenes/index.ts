import {Bot} from "grammy";
import {createConversation} from "@grammyjs/conversations";
import {registrationScene} from "./registration/registration";
import {MyContext} from "../../types/type";
import {photoCheckScene} from "./photoCheck/photoCheckScene";
import {surveyScene} from "./survey/surveyScene";
import {inviteScene} from "./invite/inviteScene";
import {withdrawalScene} from "./withdrawal/withdrawalScene";

export enum Scenes {
    RegisterScene = "RegisterScene",
    PhotoCheckScene = "PhotoCheckScene",
    SurveyScene = "SurveyScene",
    InviteScene = "InviteScene",
    WithdrawalScene = "WithdrawalScene",
}


export function registerScenes(bot: Bot<MyContext>) {

    // Регистрируем сцену
    bot.use(createConversation(registrationScene, Scenes.RegisterScene));
    bot.use(createConversation(photoCheckScene, Scenes.PhotoCheckScene));
    bot.use(createConversation(surveyScene, Scenes.SurveyScene));
    bot.use(createConversation(inviteScene, Scenes.InviteScene));
    bot.use(createConversation(withdrawalScene, Scenes.WithdrawalScene));

}
