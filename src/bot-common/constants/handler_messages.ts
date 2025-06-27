import { BUTTONS_KEYBOARD } from "./buttons";

export const HANDLER_NEW_SURVEYS = {
  NO_NEW_SURVEYS: "У вас нет новый опросов.",
  TG_ACC: "Юзернейм:",
  CODE_WORD: "Кодовое слово: ",
  HEADER:
    "Пользователи будут уведомлены о том, что им нужно написать вам. Если пользователь написал, то нажмите на соответсвующую ему кнопку ниже",

  SOME_ERROR: "Бот временно недоступен",
};
export const HANDLER_RECHECK_SURVEYS = {
  NO_RECHECK_SURVEYS: "У вас нет опросов на перезаполнение.",
  RECHECK_NUMBER_ID: "Перезаполнить запись №",
  HEADER: "Вот записи, которые нужно перезаполнить.",

  SOME_ERROR: "Бот временно недоступен",
};
export const HANDLER_RESTART_FAILED_PAYMENT = {
  NO_FAILED_PENDING_PAYMENTS:
    "Нет неуспешных платежей, которые можно перезапустить.",
  SUCCESS: "Платежи были направлены в очередь на проведение.",

  SOME_ERROR: "Бот временно недоступен",
};
export const HANDLER_CURRENT_SURVEYS = {
  NO_CURRENT_SURVEYS: "У вас нет текущих опросов.",
  TG_ACC: "Юзернейм:",
  CODE_WORD: "Кодовое слово: ",
  HEADER:
    "Нажмите на кнопку ниже, что бы узнать информацию об опросе либо что бы закрыть опрос",

  SOME_ERROR: "Бот временно недоступен",
};
export const HANDLER_MANUAL_PAYMENT = {
  AUTO_PAYMENT_ON: `Включено автоматическое проведение платежей. Вручную можно провести только платежи, которые по какой-то причине не смогли пройти автоматически.`,
  AVAILABLE_PAYMENTS: `Платежи, доступные для проведения вручную.`,
  NO_AVAILABLE_PAYMENTS: `В данным момент нет платежей, доступных для проведения вручную.`,
  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.ManualPayment}'.`,
};
export const HANDLER_GET_USER_LOGS = {
  SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_KEYBOARD.GetUsersLogs}'.`,
};
