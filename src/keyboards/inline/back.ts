// Клавиатура на первом экране
import {InlineKeyboard} from "grammy";
import {BUTTONS} from "../../config/constants";

export const backKeyboard = new InlineKeyboard()
    .text(BUTTONS.BackButtonText, BUTTONS.BackButton)
