import {Keyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";

export const MainMenuKeyboard=()=> (

    new Keyboard()
        .text(BUTTONS.SurveyButtonText)
        .row()
        .text(BUTTONS.InviteButtonText)
        .text(BUTTONS.BalanceButtonText)

)
