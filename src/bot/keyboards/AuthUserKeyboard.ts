import {Keyboard} from "grammy";
import {BUTTONS_KEYBOARD} from "../constants/button";

export const AuthUserKeyboard=()=> (

    new Keyboard()
        .text(BUTTONS_KEYBOARD.SurveyButton)
        .row()
        .text(BUTTONS_KEYBOARD.InviteButton)
        .text(BUTTONS_KEYBOARD.BalanceButton)
        .resized()

)
