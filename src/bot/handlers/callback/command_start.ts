import {InlineKeyboard} from "grammy";
import {findUserByTelegramId} from "../../../database/queries/userQueries";
import {addReferral} from "../../../database/queries/referralQueries";
import {MyContext} from "../../types/type";
import {MESSAGES} from "../../constants/messages";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";

export const handleStartCommand = async (ctx: MyContext) => {
    // Извлекаем реферальный код, если пользователь перешёл по реферальной ссылке.
    const referral = ctx?.match ??null;

    // Получаем ID текущего пользователя Telegram, вызвавшего команду `/start`.
    const userId = ctx.from?.id;

    if (!userId) {
        return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }

    // Проверяем, существует ли пользователь в базе данных
    const user = await findUserByTelegramId(userId);

    if (!user) {

        if (referral) {
            // Сохраняем реферальный код, если еще нет записи по текущему юзеру
            await addReferral(userId, Number(referral));
        }
        return ctx.reply(MESSAGES.WELCOME_MENU_USER, {
            parse_mode: "HTML", // Указываем, что текст содержит HTML
            reply_markup:new InlineKeyboard()
                .text(BUTTONS_CALLBACK_QUERIES.RegistrationButtonText, BUTTONS_CALLBACK_QUERIES.RegistrationButton)
        });
    }

    return ctx.reply(MESSAGES.WELCOME_OLD_USER, {
        reply_markup:new InlineKeyboard()
            .text(BUTTONS_CALLBACK_QUERIES.IdentificationButtonText, BUTTONS_CALLBACK_QUERIES.IdentificationButton)
    });
};
