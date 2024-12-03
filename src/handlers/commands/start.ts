import {MESSAGES} from "../../constants/constants";
import {welcomeKeyboard} from "../../keyboards/inline/welcome";

import {MyContext} from "../../types/type";
import {api} from "../../services/api/api";
import {OpenWebAppKeyboard} from "../../keyboards/reply/openWebApp";
import {identificationKeyboard} from "../../keyboards/inline/identification";

export async function handleStartCommand(ctx: MyContext) {
    const userId = ctx?.from?.id.toString() ?? '';

    //Проверяем, зарегистрирован ли уже наш юзер
    api.check_exist_by_id(userId).then(res => {
        if (res.status === 1) {
            ctx.reply(
                MESSAGES.welcome_old_user,
                {
                    reply_markup: identificationKeyboard,
                }
            );
        } else if (res.status === 0) {
            ctx.reply(
                MESSAGES.welcome_new_user,
                {
                    parse_mode: "HTML",
                    reply_markup: welcomeKeyboard
                }
            );
        } else if (res.status === 2) {
            ctx.reply(
                MESSAGES.welcome_new_user,
                {
                    parse_mode: "HTML",
                    reply_markup: welcomeKeyboard
                }
            );
        }
    })


}
