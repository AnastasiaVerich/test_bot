import {Bot} from "grammy";
import {createConversation} from "@grammyjs/conversations";
import {MyContext} from "../../bot-common/types/type";
import {registrationSupervisorScene} from "./registration_supervisor";
import {addAdvertisingCampaignScene} from "./add_advertising_campaign";

export enum ScenesSupervisor {
    RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
    AddAdvertisingCampaignScene = "AddAdvertisingCampaignScene", // eslint-disable-line no-unused-vars
}
export type ScenesSupervisorType = typeof ScenesSupervisor[keyof typeof ScenesSupervisor];

export function registerScenes(bot: Bot<MyContext>): void {
    // Регистрируем сцену
    bot.use(createConversation(registrationSupervisorScene, {id: ScenesSupervisor.RegisterScene}));
    bot.use(createConversation(addAdvertisingCampaignScene, {id: ScenesSupervisor.AddAdvertisingCampaignScene}));
}
