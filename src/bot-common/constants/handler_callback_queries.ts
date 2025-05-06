import {BUTTONS_CALLBACK_QUERIES} from "./buttons";

export const HANDLER_BALANCE = {
    USER_ID_UNDEFINED: "Произошла ошибка. Начните заново с команды /start.",
    NO_PENDING_PAYMENT:"Нет ожидающих платежей",
    RUB:'РУБ',
    OR:'или',
    BALANCE: "На Вашем балансе",
    BALANCE_PENDING: "Ожидающие платежи",
    SOME_ERROR: "Бот временно недоступен",

};

export const HANDLER_HISTORY_ACCRUAL = {

    NO_ACCRUAL:"Нет начислений",
    NO_REFERRAL_ACCRUAL:"Нет начислений",
    RUB:'РУБ',
    BALANCE_ACCRUAL_HISTORY: "История начислений",
    BALANCE_ACCRUAL_REFERRAL_HISTORY: "История начислений по рефералкам",
    SOME_ERROR: "Бот временно недоступен",
};

export const HANDLER_HISTORY_WITHDRAWAL = {

    NO_HISTORY_WITHDRAWAL: "Нет завершенных платежей",
    BALANCE_HISTORY: "История операций",
    SOME_ERROR: "Бот временно недоступен",

};

export const HANDLER_TOOK_SURVEY = {
    TOOK_IT__NOW_TG_ACC: 'Пользователь @{tg_account} будет уведомлен о том, что ему нужно написать вам.',
    TOOK_IT__NOW_CODE_WORD: 'Пользователь будет уведомлен о том, что ему нужно написать вам. Кодовая комбинация:',
    CONFIRMATION: `Если пользователь написал вам, то нажмите на ${BUTTONS_CALLBACK_QUERIES.UserWriteButtonText}. Если не написал, то в течении {res_time} резервация будет снята.`,

    SOME_ERROR: "Бот временно недоступен",

};
