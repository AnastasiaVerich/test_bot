import {InlineKeyboard} from "grammy";
import {BUTTONS} from "../../config/constants";

export const welcomeKeyboard = new InlineKeyboard()
    .text(BUTTONS.RegistrationButtonText, BUTTONS.RegistrationButton)
    .text(BUTTONS.LoginButtonText, BUTTONS.LoginButton);
