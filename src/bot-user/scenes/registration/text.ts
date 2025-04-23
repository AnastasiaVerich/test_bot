import {BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD} from "../../constants/button";

export const REGISTRATION_SCENE = {
    ENTER_PHONE:
        "Для регистрации пришлите свой номер телефона." +
        "\n" +
        "\n" +
        `Нажмите на кнопку '${BUTTONS_CALLBACK_QUERIES.SendNumberButtonText}', которая появилась внизу экрана.`,

    ENTER_PHONE_OTHERWISE: `Пожалуйста, отправьте номер, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.SendNumberButtonText}'.`,

    ENTERED_NOT_USER_PHONE: "Пожалуйста, отправьте свой собственный номер.",

    ENTERED_USER_PHONE: "Спасибо! Ваш номер:",


    VERIFY_BY_PHOTO: "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо.",
    VERIFY_BY_PHOTO_OTHERWISE: `Пожалуйста, пройдите фотоконтроль, нажав на кнопку '${BUTTONS_KEYBOARD.OpenAppButton}'.`,

    USER_EXIST: "Вероятно у вас уже есть другой аккаунт.",

    USER_IN_BLOCK: "Вы не можете пользоваться данным ботом.",

    SUCCESS: "Отлично! Регистрация пройдена. Вы можете приступить к прохождению опросов.",

    SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.RegistrationButtonText}'.`,
};

