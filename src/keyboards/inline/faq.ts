import {InlineKeyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";

export const FAQMenuKeyboard = new InlineKeyboard()
    .text(BUTTONS.BackButtonText, BUTTONS.BackButton)
    .text("какой-то вопрос", "https://core.telegram.org/bots/tutorial");
