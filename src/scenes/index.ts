import { Bot } from "grammy";
import {conversations, createConversation} from "@grammyjs/conversations";
import {registrationScene} from "./registration";
import {MyContext} from "../index";
import {SCENES} from "../config/constants";

export function registerScenes(bot: Bot<MyContext>) {

    // Регистрируем сцену
    bot.use(createConversation(registrationScene, SCENES.REGISTRATION));
}
