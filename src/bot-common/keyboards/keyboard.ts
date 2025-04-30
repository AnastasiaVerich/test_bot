import {Keyboard} from "grammy";
import {BUTTONS_KEYBOARD} from "../constants/buttons";
import {WEB_APP_URL} from "../../config/env";

export const sendUserPhone = (): Keyboard => new Keyboard()
    .requestContact(BUTTONS_KEYBOARD.SendNumberButton)
    .resized()
    .persistent();

export const ConfirmCancelButtons = ():Keyboard=> new Keyboard()
    .text(BUTTONS_KEYBOARD.ConfirmButton)
    .text(BUTTONS_KEYBOARD.CancelButton)
    .resized()
    .oneTime()

export const ConfirmButton = ():Keyboard=> new Keyboard()
    .text(BUTTONS_KEYBOARD.ConfirmButton)
    .resized()
    .oneTime()

export const SkipButton = ():Keyboard=> new Keyboard()
    .text(BUTTONS_KEYBOARD.SkipButton)
    .resized()
    .oneTime()

export const EmptyKeyboard = (): Keyboard => new Keyboard().resized().oneTime();


export const sendLocation = (): Keyboard => new Keyboard()
    .requestLocation(BUTTONS_KEYBOARD.GeolocationButton)
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
): Keyboard =>
    new Keyboard()
        .webApp(
            BUTTONS_KEYBOARD.OpenAppButton,
            `${WEB_APP_URL}?data=${encodeURIComponent(
                JSON.stringify({
                    userId,
                    userPhone,
                    type: type,
                    isSavePhoto: isSavePhoto,
                }),
            )}`,
        )
        .resized();
