import { Bot } from "grammy";
import {conversations, createConversation} from "@grammyjs/conversations";
import {registrationScene} from "./registration";
import {SCENES} from "../constants/constants";
import {MyContext} from "../types/type";
import {identificationScene} from "./identification";

export function registerScenes(bot: Bot<MyContext>) {

    // Регистрируем сцену
    bot.use(createConversation(registrationScene, SCENES.REGISTRATION));

    bot.use(createConversation(identificationScene, SCENES.IDENTIFICATION));
}
