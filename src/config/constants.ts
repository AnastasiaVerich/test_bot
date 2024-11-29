export const MESSAGES = {
   welcome: "Добро пожаловать в <b>Green apple!</b>  \n" +
        "Мы рады видеть вас среди участников нашего сервиса.  \n" +
        "\n" +
        "Здесь вы можете:  \n" +
        "— Участвовать в опросах,  \n" +
        "— Приглашать друзей,  \n" +
        "— Получать вознаграждение 💸  \n" +
        "\n" +
        "<b>Как это работает:</b>  \n" +
        "1\. <b>Регистрируйтесь</b> за минуту  \n" +
        "2\. <b>️Участвуйте</b> в опросах  \n" +
        "3\. <b>Приглашайте</b> друзей  \n" +
        "4\. <b>Получайте</b> вознаграждение  \n" +
        "\n" +
        //"<a href=\"https://example.com\">Давайте начнем прямо сейчас!🚀</a>\n" +
        "Давайте начнем прямо сейчас!🚀\n"
    ,

    startMenu: "Чтобы использовать бота, нажмите здесь",

    registrationMessage: "Добро пожаловать сюда! Давайте начнем прямо сейчас.\n\nДля регистрации отправьте номер",

    secondMenu: "<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.",
    geolocationRequest: "Пожалуйста, отправьте вашу геопозицию.",
    none:"Пока в разработке",
};

export const BUTTONS = {

    RegistrationButton: "REGISTRATION",
    RegistrationButtonText: "Регистрация",

    LoginButton: "LOG_IN",
    LoginButtonText: "Вход",

    FAQButton: "faq",
    FAQButtonText: "Вопросы/ответы",

    GeolocationButton: "geolocation",
    GeolocationButtonText: "Геолокация",

    BackButton: "Back",
    BackButtonText: "Назад",


    SendNumberButton: "SEND_NUMBER",
    SendNumberButtonText: "Отправить номер",

    OpenAppButton: "OPEN_APP",
    OpenAppButtonText: "Пройти фотоконтроль",
};

export const COMMANDS = {
    MENU: "menu",
    START: "start",
};

export const SCENES = {
    REGISTRATION: "registration",
};
export const SCENES_REGISTRATION = {
    InterNumber: "Для регистрации пришлите свой номер телефона." +
        "\n" +
        "\n" +
        "Нажмите на кнопку: Отправить номер",

    InterPhoto: "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо",
};
