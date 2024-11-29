import {Keyboard} from "grammy";

export const geolocationKeyboard = new Keyboard()
    .requestLocation("Отправить геопозицию")
    .resized()
    .oneTime();
