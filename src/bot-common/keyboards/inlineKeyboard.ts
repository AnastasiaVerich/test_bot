import {InlineKeyboard} from "grammy";
import {BUTTONS_CALLBACK_QUERIES} from "../constants/buttons";

export const RegistrationKeyboard = (): InlineKeyboard => new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.RegistrationButtonText,
    BUTTONS_CALLBACK_QUERIES.RegistrationButton,
);

export const FinishSurveyKeyboard = (): InlineKeyboard => new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.FinishSurveyButtonText,
    BUTTONS_CALLBACK_QUERIES.FinishSurveyButton,
);
export const IdentificationKeyboard = (): InlineKeyboard => new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.IdentificationButtonText,
    BUTTONS_CALLBACK_QUERIES.IdentificationButton,
);

export const BalanceMenu = (): InlineKeyboard =>
    new InlineKeyboard()
        .text(
            BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
            BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton
        )
        .row()
        .text(
            BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButtonText,
            BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton
        )
        .row()
        .text(
            BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButtonText,
            BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton
        )

