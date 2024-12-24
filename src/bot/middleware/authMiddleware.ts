import { Middleware } from "grammy";
import {findUserByTelegramId} from "../../database/queries/userQueries";
import {MESSAGES} from "../constants/messages";
import {MyContext} from "../types/type";

export const authMiddleware: Middleware<MyContext> = async (ctx, next) => {
    const userId = ctx.from?.id;

    if (!userId) {
        await ctx.reply(MESSAGES.USER_ID_UNDEFINED);
        return;
    }

    // Проверка пользователя в базе данных
    const user = await findUserByTelegramId(userId);

    if (!user) {
        await ctx.reply(MESSAGES.YOU_NOT_AUTH);
        return;
    }

    // Если пользователь авторизован, передаем управление следующему middleware
    return next();
};
