import {InlineKeyboard, Keyboard} from "grammy";
import {BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD} from "../constants/button";
import {WEB_APP_URL} from "../../config/env";

export const RegistrationKeyboard = (): InlineKeyboard => new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.RegistrationButtonText,
    BUTTONS_CALLBACK_QUERIES.RegistrationButton,
);
export const IdentificationKeyboard = (): InlineKeyboard => new InlineKeyboard().text(
    BUTTONS_CALLBACK_QUERIES.IdentificationButtonText,
    BUTTONS_CALLBACK_QUERIES.IdentificationButton,
);

export const sendUserPhone = (): Keyboard => new Keyboard()
    .requestContact(BUTTONS_CALLBACK_QUERIES.SendNumberButtonText)
    .resized()
    .persistent();

export const sendLocation = (): Keyboard => new Keyboard()
    .requestLocation(BUTTONS_KEYBOARD.GeolocationButton)
    .resized()
    .oneTime()

export const ConfirmButtons = ():Keyboard=> new Keyboard()
        .text(BUTTONS_KEYBOARD.ConfirmButton)
        .text(BUTTONS_KEYBOARD.CancelButton)
        .resized()
        .oneTime()

export const AuthUserKeyboard = (): Keyboard =>
    new Keyboard()
        .text(BUTTONS_KEYBOARD.SurveyButton)
        .row()
        .text(BUTTONS_KEYBOARD.InviteButton)
        .text(BUTTONS_KEYBOARD.BalanceButton)
        .resized();

export const WebAppKeyboard = (
    userId: number,
    userPhone: string,
    type: "identification" | "registration",
    isSavePhoto: "0" | "1",
): InlineKeyboard =>
    new InlineKeyboard().webApp(
        BUTTONS_KEYBOARD.OpenAppButton, // Текст кнопки
        {
            url: `${WEB_APP_URL}?data=${encodeURIComponent(
                JSON.stringify({
                    userId,
                    userPhone,
                    type,
                    isSavePhoto,
                }),
            )}`,
        },
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


