import { Keyboard } from "grammy";
import { BUTTONS_KEYBOARD } from "../constants/button";
import { WEB_APP_URL } from "../../config/env";

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
