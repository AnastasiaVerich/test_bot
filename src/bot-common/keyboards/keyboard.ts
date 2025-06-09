import { Keyboard } from "grammy";
import { BUTTONS_KEYBOARD } from "../constants/buttons";
import { WEB_APP_URL } from "../../config/env";

export const sendUserPhone = (): Keyboard =>
  new Keyboard()
    .requestContact(BUTTONS_KEYBOARD.SendNumberButton)
    .resized()
    .persistent();

export const ConfirmCancelButtons = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.ConfirmButton)
    .text(BUTTONS_KEYBOARD.CancelButton)
    .resized()
    .oneTime();

export const YesNoButtons = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.YesButton)
    .text(BUTTONS_KEYBOARD.NoButton)
    .resized()
    .oneTime();

export const OnButtons = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.OnButton)
    .text(BUTTONS_KEYBOARD.CancelButton)
    .resized()
    .oneTime();

export const OffButtons = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.OffButton)
    .text(BUTTONS_KEYBOARD.CancelButton)
    .resized()
    .oneTime();

export const EmptyKeyboard = (): Keyboard => new Keyboard().resized().oneTime();

export const sendLocation = (): Keyboard =>
  new Keyboard()
    .requestLocation(BUTTONS_KEYBOARD.GeolocationButton)
    .resized()
    .oneTime();

export const AuthUserKeyboard = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.SurveyButton)
    .row()
    .text(BUTTONS_KEYBOARD.InviteButton)
    .text(BUTTONS_KEYBOARD.BalanceButton)
    .resized();

export const AuthOperatorKeyboard = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.NewSurveys)
    .row()
    .text(BUTTONS_KEYBOARD.CurrentSurveys)
    .resized();

export const AuthSupervisorKeyboard = (): Keyboard =>
  new Keyboard()
    .text(BUTTONS_KEYBOARD.GetUsersLogs)
    .row()
    .text(BUTTONS_KEYBOARD.AddAdvertisingCampaign)
    .row()
    .text(BUTTONS_KEYBOARD.AddNewSurveys)
    .row()
    .text(BUTTONS_KEYBOARD.AddNewOperators)
    .row()
    .text(BUTTONS_KEYBOARD.SwitchPaymentType)
    .row()
    .text(BUTTONS_KEYBOARD.ManualPayment)
    .row()
    .text(BUTTONS_KEYBOARD.RestartFailedPayments)
    .row()
    .resized();

export const createKeyboardFromWords = (words: string[]): Keyboard => {
  const keyboard = new Keyboard();

  for (const word of words) {
    keyboard.text(word).row(); // Добавляем кнопку с текстом и переходим на новую строку
  }

  return keyboard.resized(); // Возвращаем адаптивную клавиатуру
};

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
          version: 3,
        }),
      )}`,
    )
    .resized();
