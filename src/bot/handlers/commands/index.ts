// Обработка команд

import {Bot} from "grammy";
import {MyContext} from "../../../types/type";
import {handleStartCommand} from "./callback/start";

export function registerCommands(bot: Bot<MyContext>) {
    bot.command('start', handleStartCommand);
}
