import {Keyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";

export const SendContactKeyboard = new Keyboard()
    .requestContact(BUTTONS.SendNumberButtonText)
    .resized()
    .oneTime();
