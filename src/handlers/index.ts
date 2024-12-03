import {Bot} from "grammy";
import {BUTTONS, COMMANDS} from "../constants/constants";
import {handleStartCommand} from "./commands/start";
import {handleRegistration} from "./callbackQueries/registration";
import {handleMenuCommand} from "./commands/menu";
import {handleBack} from "./callbackQueries/back";
import {handleFaq} from "./callbackQueries/faq";
import {handleGeolocation} from "./callbackQueries/geolocation";
import {handleNone} from "./callbackQueries/none";

import {MyContext} from "../types/type";
import {handleIdentification} from "./callbackQueries/identification";

// Обработка /команд
export function registerCommands(bot: Bot<MyContext>) {
    bot.command(COMMANDS.START, handleStartCommand);
    //bot.command(COMMANDS.MENU, handleMenuCommand);
}

// Обработка callback-запросов
export function registerCallbackQueries(bot: Bot<MyContext>) {
    bot.callbackQuery(BUTTONS.RegistrationButton, handleRegistration);
    bot.callbackQuery(BUTTONS.IdentificationButton, handleIdentification);

    bot.callbackQuery(BUTTONS.BackButton, handleBack);
    bot.callbackQuery(BUTTONS.FAQButton, handleFaq);
    bot.callbackQuery(BUTTONS.GeolocationButton, handleGeolocation);
}
