import {BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD} from "../../constants/button";

export const IDENTIFICATION_SCENE = {
    USER_NOT_EXIST: 'Вашего пользователя не существует.',

    VERIFY_BY_PHOTO: "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо.",

    VERIFY_BY_PHOTO_OTHERWISE: `Пожалуйста, пройдите фотоконтроль, нажав на кнопку '${BUTTONS_KEYBOARD.OpenAppButton}'.`,

    USER_IN_BLOCK: "Вы не можете пользоваться данным ботом.",

    NOT_SIMILAR: "Фотоконтроль не пройден.",

    SUCCESS: "Отлично! Фотоконтроль пройден. Вы можете приступить к прохождению опросов.",

    SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.IdentificationButtonText}'.`,

}
