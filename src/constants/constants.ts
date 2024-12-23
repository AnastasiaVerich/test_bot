
export const WELCOME_MENU_USER = "Добро пожаловать в <b>Green apple!</b>  \n" +
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
export const WELCOME_OLD_USER = 'Рады снова видеть вас в Green Apple! 🍏'
export const MESSAGES = {
    welcome_old_user:'Рады снова видеть вас в Green Apple! 🍏',

    identification_photo:"Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо",
    identification_error:'Фотоконтроль не пройден.',
    identification_user_block:'Вы не можете пользоваться данным ботом.',
    identification_success:'Отлично! Фотоконтроль пройден. Вы можете приступить к прохождению опросов.',

    registration_number: "Для регистрации пришлите свой номер телефона." +
        "\n" +
        "\n" +
        "Нажмите на кнопку: Отправить номер",

    registration_photo: "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо",
    registration_error:'Ваш аккаунт заблокирован, вероятно у вас уже есть другой аккаунт.',
    registration_user_block:'Вы не можете пользоваться данным ботом.',
    registration_success:'Отлично! Фотоконтроль пройден. Вы можете приступить к прохождению опросов.',


    survey_location:'Разрешите доступ к геопозиции, чтобы мы могли подобрать опрос для вашего региона.',
    survey_location_error:'Геолокация не доступна',
    survey_location_missing:'Повторите попытку позже',

    survey_search_survey_error:'Повторите попытку позже',
    survey_search_survey_timeout:'Следующий опрос будет доступен не раньше, чем',
    survey_search_survey_region_reject:'К сожалению в вашем регионе нет новых опросов, попробуйте позже',
    survey_search_survey_operator_reject:'К сожалению в вашем регионе нет свободных операторов, попробуйте позже',
    survey_success:'проведет с Вами опрос, обязательно напишите ему в Telegram, о том что Вы готовы пройти опрос. Он перезвонит Вам в самое ближайшее время',
    //survey_success:'Опрос пройден, ожидайте начисления средств.',

    withdrawal_of_money_wallet:'Выберите кошелек:"[Кошелек Telegram @wallet]"',


    server_error:'Бот в данный момент недоступен',
    common_error:'Повторите попытку позже',
    web_app_data_error:'Ожидались данные из Web App, но пришло что-то другое.',

    balance:'На Вашем счету',
    balance_history:'История Ваших опросов и рекомендаций',




    invite_message: "Проходи опросы и получай по 100 рублей за каждый",
    invite_friends: "Пригласи друга и получи 100 рублей за пройденный им первый опрос\n\nТвоя ссылка:\n",

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

    FAQButton: "FAQ",
    FAQButtonText: "Вопросы/ответы",

    GeolocationButton: "GEOLOCATION",
    GeolocationButtonText: "Геолокация",

    BackButton: "BACK",
    BackButtonText: "Назад",

    WithdrawalOfMoneyButton: "WITHDRAWAL_OF_MONEY",
    WithdrawalOfMoneyButtonText: "Вывод средств",

    SendNumberButton: "SEND_NUMBER",
    SendNumberButtonText: "Отправить номер",

    OpenAppButton: "OPEN_APP",
    OpenAppButtonText: "Пройти фотоконтроль",

    SurveyButton: "SURVEY",
    SurveyButtonText: "Пройти опрос",

    InviteButton: "INVITE",
    InviteButtonText: "Пригласить друга",

    BalanceButton: "BALANCE",
    BalanceButtonText: "Баланс",

    ShareButton: "SHARE",
    ShareButtonText: "Поделиться",
};

