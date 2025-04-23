import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";

export const WITHDRAWAL_SCENE = {
    HAS_PENDING_PAYMENT: "Вы уже поставили средства на вывод.",

    INVALID_BALANCE: "У вас нулевой баланс в TON.",


    ENTER_AMOUNT: "Введите сумму для снятия",

    ENTERED_AMOUNT_OTHERWISE: "Пожалуйста, введите сумму для снятия TON",

    INVALID_AMOUNT: "Введена невалидная сумма. Она должна быть больше 0.05 TON и не меньше вашего баланса (доступно: {balance} TON). Попробуйте еще раз.",

    ENTERED_AMOUNT: "Введенная сумма для снятия: ",


    ENTER_WALLET:
        "Вывод денег осуществляется в TON. Пришлите адрес вашего счета.\n" +
        "\n" +
        "Внимание! Если вы ошибетесь в адресе счета, Ваши деньги безвозвратно уйдут! Для своего удобства, можете использовать встроенный в телеграм кошелек @wallet. Инструкция по созданию кошелька https://{url видео например}.com",

    ENTER_WALLET_OTHERWISE: "Пожалуйста, введите кошелек.",

    ENTERED_INVALID_WALLET: "Вы ввели невалидный адрес. Попробуйте ещё.",


    CONFIRMATION:
        "Подтвердите снятие <b>{amount}</b> на адрес: <b>{address}</b>.",
    CONFIRMATION_OTHERWISE:
        "Нажмите на соответсвующую кнопку для подтверждения или отклонения вывода средств.",

    SUCCESS: "Операция отправлена на исполнение. Ожидайте перевод в течении 24 ч.",
    CANCELLED: "Операция была отменена.",



    SELECT_SOURCE: "Выберите, как хотите вывести деньги",

    SOME_ERROR: `Произошла ошибка. Начните заново, нажав на кнопку '${BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText}'.`,

}
