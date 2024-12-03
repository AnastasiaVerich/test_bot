export const MESSAGES = {
   welcome_new_user: "Добро пожаловать в <b>Green apple!</b>  \n" +
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
    welcome_old_user:'Рады снова видеть вас в Green Apple! 🍏',

    identification_photo:"Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо",
    identification_error:'Фотоконтроль не пройден.',
    identification_success:'Отлично! Фотоконтроль пройден. Вы можете приступить к прохождению опросов.',

    registration_number: "Для регистрации пришлите свой номер телефона." +
        "\n" +
        "\n" +
        "Нажмите на кнопку: Отправить номер",

    registration_photo: "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо",
    registration_error:'Ваш аккаунт заблокирован, вероятно у вас уже есть другой аккаунт.',
    registration_success:'Отлично! Фотоконтроль пройден. Вы можете приступить к прохождению опросов.',


    server_error:'Бот в данный момент недоступен',
    web_app_data_error:'Ожидались данные из Web App, но пришло что-то другое.',




    startMenu: "Чтобы использовать бота, нажмите здесь",

    registrationMessage: "Добро пожаловать сюда! Давайте начнем прямо сейчас.\n\nДля регистрации отправьте номер",

    secondMenu: "<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.",
    geolocationRequest: "Пожалуйста, отправьте вашу геопозицию.",
    none:"Пока в разработке",
};

export const BUTTONS = {

    RegistrationButton: "REGISTRATION",
    RegistrationButtonText: "Регистрация",

    IdentificationButton: "IDENTIFICATION",
    IdentificationButtonText: "Идентификация",

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
    IDENTIFICATION: "identification",
};

