import {Keyboard} from "grammy";
import {BUTTONS} from "../../config/constants";

export const SendContactKeyboard = new Keyboard()
    .requestContact(BUTTONS.SendNumberButtonText)
    .resized()
    .oneTime();
