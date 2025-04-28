import {Message} from "grammy/types";
import {findOperatorByTgAccount} from "../../../database/queries/operatorQueries";
import {getUserAccount} from "../../utils/getUserTgAccount";
import {COMMAND_OPERATOR_START} from "../../../bot-common/constants/handler_command";
import {RegistrationKeyboard} from "../../../bot-common/keyboards/inlineKeyboard";
import {MyContext} from "../../../bot-common/types/type";
import logger from "../../../lib/logger";

export const handleStartCommand = async (
    ctx: MyContext,
): Promise<Message.TextMessage | void> => {
    try {

        // Получаем ID текущего пользователя Telegram
        const userAccount = await getUserAccount(ctx);
        if (!userAccount) return;

        // Проверяем, существует ли пользователь в базе данных в списке разрешенных операторов
        const operator = await findOperatorByTgAccount(userAccount);
        if (!operator) {
            return ctx.reply(COMMAND_OPERATOR_START.WELCOME_UNDEFINED, {
                reply_markup: {remove_keyboard: true},
            });
        }

        logger.info(operator)
        if (!operator.phone) {
            return ctx.reply(COMMAND_OPERATOR_START.WELCOME_NEW_OPERATOR, {
                parse_mode: "HTML",
                reply_markup: RegistrationKeyboard(),
            });
        }
        return ctx.reply(COMMAND_OPERATOR_START.WELCOME_OLD_OPERATOR, {
            reply_markup: {remove_keyboard: true},
        });


    } catch (error) {
        logger.info(error)
        return ctx.reply(COMMAND_OPERATOR_START.SOME_ERROR, {
            reply_markup: {remove_keyboard: true},
        });
    }
};
