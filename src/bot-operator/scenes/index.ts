import {Bot} from "grammy";
import {MyContext} from "../types/type";

export enum Scenes {
    RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars

}

export function registerScenes(bot: Bot<MyContext>): void {
    // Регистрируем сцену
    //bot.use(createConversation(registrationScene, {id: Scenes.RegisterScene}));

}
