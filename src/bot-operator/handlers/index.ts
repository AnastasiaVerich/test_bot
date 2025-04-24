import {Bot} from "grammy";
import {MyContext} from "../types/type";
import {handleStartCommand} from "./callback/command_start/command_start";


export function registerCommands(bot: Bot<MyContext>): void {
    bot.command("start", handleStartCommand);
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {

}

export function registerMessage(bot: Bot<MyContext>): void {

}
