import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../types/type";
import {AuthUserKeyboard} from "../keyboards/AuthUserKeyboard";
import {faceCheckMiddleware} from "../middleware/faceCheckMiddleware";
import {IDENTIFICATION_SCENE} from "../constants/scenes";


export async function identificationScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const isVerified = await faceCheckMiddleware(conversation, ctx);

    if(isVerified){
        await ctx.reply(IDENTIFICATION_SCENE.SUCCESS,{
            reply_markup:AuthUserKeyboard()
        });
    } else {
        await ctx.reply(IDENTIFICATION_SCENE.FAILED);
    }
}
