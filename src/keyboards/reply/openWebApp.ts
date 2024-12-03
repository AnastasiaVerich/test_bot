import {Keyboard} from "grammy";
import {BUTTONS} from "../../constants/constants";
import {WEB_APP_URL} from "../../config/config";
import {ParamsType} from "../../types/type";
export const OpenWebAppKeyboard=(params:ParamsType)=> (
    new Keyboard()
    .webApp(BUTTONS.OpenAppButtonText, `${WEB_APP_URL}?data=${encodeURIComponent(JSON.stringify(params))}`)
    .resized()
    .oneTime()
)
