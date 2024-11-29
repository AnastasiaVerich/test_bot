import {Bot} from "grammy";
import {BUTTONS, COMMANDS} from "../config/constants";
import {handleStartCommand} from "./commands/start";
import {handleRegistration} from "./callbackQueries/registration";
import {handleMenuCommand} from "./commands/menu";
import {handleBack} from "./callbackQueries/back";
import {handleFaq} from "./callbackQueries/faq";
import {handleGeolocation} from "./callbackQueries/geolocation";
import {handleNone} from "./callbackQueries/none";
import {MyContext} from "../index";

// Обработка /команд
export function registerCommands(bot: Bot<MyContext>) {
    bot.command(COMMANDS.MENU, handleMenuCommand);
    bot.command(COMMANDS.START, handleStartCommand);
}

// Обработка callback-запросов
export function registerCallbackQueries(bot: Bot<MyContext>) {
    bot.callbackQuery(BUTTONS.RegistrationButton, handleRegistration);
    bot.callbackQuery(BUTTONS.LoginButton, handleNone);

    bot.callbackQuery(BUTTONS.BackButton, handleBack);

    bot.callbackQuery(BUTTONS.FAQButton, handleFaq);
    bot.callbackQuery(BUTTONS.GeolocationButton, handleGeolocation);
}
