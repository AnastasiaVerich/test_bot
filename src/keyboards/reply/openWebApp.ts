import {Keyboard} from "grammy";
import {BUTTONS} from "../../config/constants";
import {WEB_APP_URL} from "../../config/config";
export const OpenWebAppKeyboard = new Keyboard()
    .webApp(BUTTONS.OpenAppButtonText, `${WEB_APP_URL}`)
    .resized()
    .oneTime();
