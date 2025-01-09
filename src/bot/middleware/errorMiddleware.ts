import { Middleware } from "grammy";

export const errorMiddleware: Middleware = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        console.error("Произошла ошибка:", error);

        // Уведомление пользователя об ошибке
        await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
    }
};
