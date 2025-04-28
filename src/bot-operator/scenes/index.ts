import {Bot} from "grammy";
import {createConversation} from "@grammyjs/conversations";
import {registrationOperatorScene} from "./registration_operator";
import {finishSurveyScene} from "./finish_survey";
import {MyContext} from "../../bot-common/types/type";

export enum ScenesOperator {
    RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
    FinishSurveyScene = "FinishSurveyScene", // eslint-disable-line no-unused-vars

}

export function registerScenes(bot: Bot<MyContext>): void {
    // Регистрируем сцену
    bot.use(createConversation(registrationOperatorScene, {id: ScenesOperator.RegisterScene}));
    bot.use(createConversation(finishSurveyScene, {id: ScenesOperator.FinishSurveyScene}));

}
