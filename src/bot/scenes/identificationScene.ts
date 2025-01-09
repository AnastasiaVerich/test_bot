import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../types/type";
import {AuthUserKeyboard} from "../keyboards/AuthUserKeyboard";
import {faceCheckMiddleware} from "../middleware/faceCheckMiddleware";
import {IDENTIFICATION_SCENE} from "../constants/scenes";


export async function identificationScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const {text} = await faceCheckMiddleware(conversation, ctx);

    switch (text) {
        case "user_is_block": {
            await ctx.reply(IDENTIFICATION_SCENE.USER_IN_BLOCK);
            console.log("Пользователь заблокирован.");
        }
            break
        case "similarity_not_confirmed": {
            await ctx.reply(IDENTIFICATION_SCENE.NOT_SIMILAR);
            console.log("Пользователь заблокирован.");
        }
            break
        case "success": {
            await ctx.reply(IDENTIFICATION_SCENE.SUCCESS, {
                reply_markup: AuthUserKeyboard()
            });
            console.log("Пользователь заблокирован.");
        }
            break
        default: {
            await ctx.reply(IDENTIFICATION_SCENE.FAILED);

        }
    }
}
