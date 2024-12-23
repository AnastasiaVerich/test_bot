
import {InlineKeyboard} from "grammy";
import {findUserByTelegramId} from "../../../../database/queries/userQueries";
import {addReferral} from "../../../../database/queries/referralQueries";
import {BUTTONS, WELCOME_MENU_USER, WELCOME_OLD_USER} from "../../../../constants/constants";
import {MyContext} from "../../../../types/type";

export const handleStartCommand = async (ctx: MyContext) => {
    // Извлекаем реферальный код, если пользователь перешёл по реферальной ссылке.
    const referral = ctx?.match ??null;

    // Получаем ID текущего пользователя Telegram, вызвавшего команду `/start`.
    const userId = ctx.from?.id;

    if (!userId) {
        return ctx.reply("Ошибка: не удалось получить информацию о пользователе.");
    }

    // Проверяем, существует ли пользователь в базе данных
    const user = await findUserByTelegramId(userId);

    if (!user) {
        if (referral) {
            // Сохраняем реферальный код, если еще нет тзаписи по текущему юзеру
            await addReferral(userId, Number(referral));
        }
        return ctx.reply(WELCOME_MENU_USER, {
            reply_markup:new InlineKeyboard()
                .text(BUTTONS.RegistrationButtonText, BUTTONS.RegistrationButton)
        });
    }

    return ctx.reply(WELCOME_OLD_USER, {
        reply_markup:new InlineKeyboard()
            .text(BUTTONS.InviteButtonText, BUTTONS.IdentificationButton)
    });
};
