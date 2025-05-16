import {MiddlewareFn} from "grammy";
import logger from "../../lib/logger";
import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext} from "../../bot-common/types/type";
import {getUserId} from "../../bot-common/utils/getUserId";
import {getSupervisorByIdPhoneOrTg} from "../../database/queries_kysely/supervisor";

export const authSupervisorMiddleware: MiddlewareFn<MyContext> = async (ctx, next) => {
    try {
        const userId = await getUserId(ctx);

        if (!userId) return;

        const supervisor = await getSupervisorByIdPhoneOrTg({supervisor_id: userId});
        if (!supervisor) return;

        // Если пользователь авторизован, передаем управление следующему middleware
        return next();
    } catch (error) {

        logger.error("Error authSupervisorMiddleware: " + error);
        await ctx.reply(RESPONSES.SOME_ERROR, {
            reply_markup: {remove_keyboard: true},
        });
    }
};
