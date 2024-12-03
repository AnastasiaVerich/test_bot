import {InlineKeyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";

export const identificationKeyboard = new InlineKeyboard()
    .text(BUTTONS.IdentificationButtonText, BUTTONS.IdentificationButton)
