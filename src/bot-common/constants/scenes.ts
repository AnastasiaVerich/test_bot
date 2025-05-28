import { BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD } from "./buttons";
import { linkWelcome } from "../../config/env";

export const FINISH_SURVEY_OPERATOR_SCENE = {
  SURVEY_ACTIVE_NOT_FOUND: "Активный опрос отсутствует",

  ENTER_COMPLETED_OR_NOT: "Пользователь выполнил это задание?",

  ENTER_COMPLETED_OR_NOT_OTHERWISE: `Нажмите на соответствующую кнопку`,

  ENTERED_NOT_CORRECT_COUNT: "Пожалуйста, введите число!",

  ENTER_RESULT: "Введите позицию сайта во время опроса",

  ENTER_RESULT_OTHERWISE: `Пожалуйста, введите число, обозначающее позицию сайта при поиске.`,

  ENTERED_NOT_CORRECT_RESULT: "Пожалуйста, введите число!",

  ENTER_RESULT_POS_VAR_1: "Выберите сайт, который был на 1ой позиции",

  ENTER_RESULT_POS_VAR_2: "Выберите сайт, который был на 2ой позиции",

  ENTER_RESULT_POS_VAR_3: "Выберите сайт, который был на 3ей позиции",

  ENTER_RES_POS_OTHERWISE: `Пожалуйста, выберете сайт.`,

  CONFIRMATION:
    "Подтвердите, что вы ввели корректные данные по окончанию прохождения опроса.",

  CONFIRMATION_OTHERWISE:
    "Нажмите на соответсвующую кнопку для подтверждения или отклонения результата прохождения опроса.",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.FinishSurveyButtonText}'.`,

  CANCELLED: `Отменено. Начните заново.`,

  SUCCESS: "Прохождение опроса подтверждено!",
};

export const REGISTRATION_OPERATOR_SCENE = {
  ENTER_PHONE:
    "Для регистрации пришлите свой номер телефона." +
    "\n" +
    "\n" +
    `Нажмите на кнопку '${BUTTONS_KEYBOARD.SendNumberButton}', которая появилась внизу экрана.`,
  ENTER_PHONE_OTHERWISE: `Пожалуйста, отправьте номер, нажав на кнопку '${BUTTONS_KEYBOARD.SendNumberButton}'.`,

  ENTERED_NOT_USER_PHONE: "Пожалуйста, отправьте свой собственный номер.",

  ENTERED_USER_PHONE: "Ваш номер:",

  ENTER_CHAT_LINK:
    "Создайте новый Telegram-чат и добавьте этого бота как администратора." +
    "\n" +
    "\n" +
    "Затем отправьте ссылку на этот чат." +
    "\n" +
    "Пример: <code>https://t.me/@YourChat</code> или <code>@YourChat</code>",

  ENTER_CHAT_LINK_OTHERWISE:
    "Пожалуйста, отправьте текстовую ссылку на Telegram-чат." +
    "\n" +
    "Пример: <code>https://t.me/@YourChat</code>",

  INVALID_CHAT_LINK:
    "Неверный формат ссылки. Пожалуйста, отправьте корректную ссылку на Telegram-чат." +
    "\n" +
    "Пример: <code>https://t.me/@YourChat</code> или <code>@YourChat</code>",

  BOT_NOT_ADMIN:
    "Бот должен быть администратором в указанном чате. Пожалуйста, добавьте бота как администратора и попробуйте снова.",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.RegistrationButtonText}'.`,

  SUCCESS:
    "Регистрация пройдена.\n\nВступите в канал для операторов, что бы получать новые опросы. Перейдите по ссылке: " +
    linkWelcome,
};

export const IDENTIFICATION_USER_SCENE = {
  USER_NOT_EXIST: "Вашего пользователя не существует.",

  VERIFY_BY_PHOTO:
    "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо.",

  VERIFY_BY_PHOTO_OTHERWISE: `Пожалуйста, пройдите фотоконтроль, нажав на кнопку '${BUTTONS_KEYBOARD.OpenAppButton}'.`,

  USER_IN_BLOCK: "Вы не можете пользоваться данным ботом.",

  NOT_SIMILAR: "Фотоконтроль не пройден.",

  SUCCESS:
    "Отлично! Фотоконтроль пройден. Вы можете приступить к прохождению опросов.",
  SUCCESS_SKIP_PHOTO: "Отлично! Вы можете приступить к прохождению опросов.",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.IdentificationButtonText}'.`,
};

export const INVITE_USER_SCENE = {
  INVITE_FRIENDS:
    "Пригласи друга и получи 100 рублей за пройденный им первый опрос\n\nТвоя ссылка:\n.",

  INVITE_MESSAGE:
    "Проходи опросы и получай от 50 рублей за каждый пройденный опрос.",
};

export const REGISTRATION_USER_SCENE = {
  ENTER_PHONE:
    "Для регистрации пришлите свой номер телефона." +
    "\n" +
    "\n" +
    `Нажмите на кнопку '${BUTTONS_KEYBOARD.SendNumberButton}', которая появилась внизу экрана.`,

  ENTER_PHONE_OTHERWISE: `Пожалуйста, отправьте номер, нажав на кнопку '${BUTTONS_KEYBOARD.SendNumberButton}'.`,

  ENTERED_NOT_USER_PHONE: "Пожалуйста, отправьте свой собственный номер.",

  ENTERED_USER_PHONE: "Спасибо! Ваш номер:",

  VERIFY_BY_PHOTO:
    "Пройдите фотоконтроль для идентификации. На фото должно быть отчетливо видно ваше лицо.",
  VERIFY_BY_PHOTO_OTHERWISE: `Пожалуйста, пройдите фотоконтроль, нажав на кнопку '${BUTTONS_KEYBOARD.OpenAppButton}'.`,

  USER_EXIST: "Вероятно у вас уже есть другой аккаунт.",

  USER_IN_BLOCK: "Вы не можете пользоваться данным ботом.",

  SUCCESS:
    "Отлично! Регистрация пройдена. Вы можете приступить к прохождению опросов.",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.RegistrationButtonText}'.`,
};

export const SURVEY_USER_SCENE = {
  USER_LOCK_UNTIL: "Следующий опрос будет доступен не раньше, чем",

  USER_BUSY: "За вами уже зарегистрирован опрос.",

  ENTER_LOCATION:
    "Разрешите доступ к геопозиции, чтобы мы могли подобрать опрос для вашего региона.\n\nЕсли вы увидите ошибку, убедитесь, что геолокация включена в настройках телефона.",

  ENTER_LOCATION_OTHERWISE: `Пожалуйста, отправьте геолокации, нажав на кнопку '${BUTTONS_KEYBOARD.GeolocationButton}'.`,

  ENTERED_NOT_USER_LOCATION:
    "Пожалуйста, отправьте свою собственную текущую локацию.",

  REGION_NOT_FOUND: "Вы не относитесь ни к какому региону",

  SURVEY_NOT_FOUND:
    "К сожалению в вашем регионе нет новых опросов, попробуйте позже",

  FAILED: "Бот в данный момент недоступен",
  INIT_PLEASE: "Следующий опрос будет доступен не раньше, чем",
  LOCATION_FAILED: "Геолокация не доступна",
  OPERATOR_NOT_FOUND:
    "К сожалению в вашем регионе нет свободных операторов, попробуйте позже",
  SUCCESS: "Опрос найден! Ожидайте оператора.",
  SUCCESS_DELETE:
    "проведет с Вами опрос, обязательно напишите ему в Telegram, о том что Вы готовы пройти опрос. Он перезвонит Вам в самое ближайшее время",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.SurveyButton}'.`,
};

export const WITHDRAWAL_USER_SCENE = {
  HAS_PENDING_PAYMENT: "Вы уже поставили средства на вывод.",

  INVALID_BALANCE: "У вас нулевой баланс в TON.",

  ENTER_AMOUNT: "Введите сумму для снятия",

  ENTERED_AMOUNT_OTHERWISE: "Пожалуйста, введите сумму для снятия TON",

  INVALID_AMOUNT:
    "Введена невалидная сумма. Она должна быть больше 0.05 TON и не меньше вашего баланса (доступно: {balance} TON). Попробуйте еще раз.",

  ENTERED_AMOUNT: "Введенная сумма для снятия: ",

  ENTER_WALLET:
    "Вывод денег осуществляется в TON. Пришлите адрес вашего счета.\n" +
    "\n" +
    "Внимание! Если вы ошибетесь в адресе счета, Ваши деньги безвозвратно уйдут! Для своего удобства, можете использовать встроенный в телеграм кошелек @wallet. Инструкция по созданию кошелька: https://youtu.be/T6AbwwSrb_M?si=AgjHlVdOwb2od0N1",

  ENTER_WALLET_OTHERWISE: "Пожалуйста, введите кошелек.",

  ENTERED_INVALID_WALLET: "Вы ввели невалидный адрес. Попробуйте ещё.",

  CONFIRMATION:
    "Подтвердите снятие <b>{amount}</b> на адрес: <b>{address}</b>.",
  CONFIRMATION_OTHERWISE:
    "Нажмите на соответсвующую кнопку для подтверждения или отклонения вывода средств.",

  SUCCESS:
    "Операция отправлена на исполнение. Ожидайте перевод в течении 24 ч.",
  CANCELLED: "Операция была отменена.",

  SELECT_SOURCE: "Выберите, как хотите вывести деньги",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText}'.`,
};

export const REGISTRATION_SUPERVISOR_SCENE = {
  ENTER_PHONE:
    "Для регистрации пришлите свой номер телефона." +
    "\n" +
    "\n" +
    `Нажмите на кнопку '${BUTTONS_KEYBOARD.SendNumberButton}', которая появилась внизу экрана.`,
  ENTER_PHONE_OTHERWISE: `Пожалуйста, отправьте номер, нажав на кнопку '${BUTTONS_KEYBOARD.SendNumberButton}'.`,

  ENTERED_NOT_USER_PHONE: "Пожалуйста, отправьте свой собственный номер.",

  ENTERED_USER_PHONE: "Ваш номер:",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.RegistrationButtonText}'.`,

  SUCCESS: "Регистрация пройдена.",
};

export const ADD_ADV_CAMPAIGN_SCENE = {
  ENTER_NAME:
    "Введите название рекламной компании, используя только числа, латинский буквы и нижнее подчеркивание ( Прим: Promo_X123 ).",
  ENTER_NAME_OTHERWISE: `Пожалуйста, введите название рекламной компании.`,
  ENTER_NAME_INVALID: `Пожалуйста, введите название рекламной компании, используя только числа, латинский буквы и нижнее подчеркивание.`,
  ENTER_NAME_EXIST: `Пожалуйста, введите другое название рекламной компании, такая уже существует.`,

  CONFIRMATION: "Сохранить рекламную компанию с названием {campaign_name}?",
  CONFIRMATION_OTHERWISE:
    "Нажмите на соответсвующую кнопку для подтверждения или отклонения сохранения новой рекламной компании.",
  CANCELLED: `Отменено.`,

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.AddAdvertisingCampaign}'.`,

  SUCCESS: "Сохранено!\n\nСсылка:\n",
};

export const ADD_NEW_OPERATORS_SCENE = {
  ENTER_USERNAME: "Введите юзернейм нового оператора.",
  ENTER_USERNAME_OTHERWISE: `Пожалуйста, введите юзернейм нового оператора.`,
  ENTER_USERNAME_INVALID: `Пожалуйста, введите корректный юзернейм.`,
  ENTER_USERNAME_EXIST: `Такой пользователь уже существует.`,

  CONFIRMATION: "Сохранить нового оператора @{operator_name}?",
  CONFIRMATION_OTHERWISE:
    "Нажмите на соответсвующую кнопку для подтверждения или отклонения сохранения нового оператора.",
  CANCELLED: `Отменено.`,

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.AddNewOperators}'.`,

  SUCCESS: "Сохранено!",
};

export const ADD_NEW_SURVEYS_SCENES = {
  ENTER_DOCUMENT: `Отправьте exel документ с новыми рекламными компаниями.`,
  ENTER_DOCUMENT_OTHERWISE: `Пожалуйста, отправьте документ.`,
  ENTER_DOCUMENT_INVALID: `Пожалуйста, отправьте файл в формате .xlsx или .xls.`,
  DOCUMENT_IS_EMPTY: `Файл пуст или не содержит данных в первом столбце.`,

  FINISH: `Обработка завершена.`,
  NOT_SAVE: `Не сохранены строки`,

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.AddNewSurveys}'.`,
};

export const SWITCH_PAYMENT_TYPE_SCENES = {
  STATE_NOW:
    "На данный момент автоматическое проведение платежей {status}.\n\nЕсли хотите {action}, нажмите на соответствующую кнопку.",

  ENTER_ON_OR_OFF_OTHERWISE: `Нажмите на соответствующую кнопку`,

  SUCCESS_ON: "Автоматическое проведение платежей включено.",
  SUCCESS_OFF: "Автоматическое проведение платежей отключено.",
  CANCELLED: "Ничего не изменили.",

  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.SwitchPaymentType}'.`,
};

export const MAKE_A_PAYMENT_SCENES = {
  NO_PENDING_PAYMENT: "Больше нет платежей в ожидании у этого пользователя.",
  INFO:
    `Совершите следующий платеж\n\n` +
    `Сумма: <code>{amount}</code>\nКошелек: <code>{address}</code>`,

  CONFIRMATION: "Вы совершили платеж?",
  CONFIRMATION_OTHERWISE:
    "Нажмите на соответсвующую кнопку для подтверждения или отклонения проведения платежа вручную.",

  SUCCESS: "Платеж совершен.",
  CANCELLED: "Отменено.",
  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.ManualPayment}'.`,
};
