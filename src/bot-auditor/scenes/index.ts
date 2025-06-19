import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";

export enum ScenesAuditor {
  RegisterScene = "RegisterScene", // eslint-disable-line no-unused-vars
}

export type ScenesAuditorType =
  (typeof ScenesAuditor)[keyof typeof ScenesAuditor];

export function registerScenes(bot: Bot<MyContext>): void {}
