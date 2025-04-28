import { MiddlewareFn } from "grammy";
import { getUserId } from "../utils/getUserId";
import logger from "../../lib/logger";
import { findUser } from "../utils/findUser";
import {isDateDifferenceAtLeast} from "../../lib/date";
import {ScenesUser} from "../scenes";
import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext} from "../../bot-common/types/type";

export const checkInitMiddleware: MiddlewareFn<MyContext> = async (ctx, next) => {
    try {
        const nowDateTime = new Date();
        const userId = await getUserId(ctx);

        if (!userId) return;

        const user = await findUser(userId, ctx);
        if (!user) return;
        if (isDateDifferenceAtLeast(nowDateTime.toString(), user.last_init, 7)) {
            await ctx.conversation.enter(ScenesUser.IdentificationScene);
            return
        }

        //если не нужна инициализация, переходим к следующему middleware
        return next();
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        logger.error("Error checkInitMiddleware: " + shortError);
        await ctx.reply(RESPONSES.SOME_ERROR, {
            reply_markup: { remove_keyboard: true },
        });
    }
};
