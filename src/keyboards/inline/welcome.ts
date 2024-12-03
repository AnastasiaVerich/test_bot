import {InlineKeyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";

export const welcomeKeyboard = new InlineKeyboard()
    .text(BUTTONS.RegistrationButtonText, BUTTONS.RegistrationButton)
