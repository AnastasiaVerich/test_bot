import {InlineKeyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";

export const MenuAuthUser=()=> (
    new InlineKeyboard()
        .text(BUTTONS.SurveyButtonText, BUTTONS.SurveyButton)
        .row()
        .text(BUTTONS.InviteButtonText,BUTTONS.InviteButton)
        .text(BUTTONS.BalanceButtonText,BUTTONS.BalanceButton)

)
