import {SCENES} from "../../config/constants";
import {MyContext} from "../../index";

export async function handleRegistration(ctx: MyContext) {
    await ctx.conversation.enter(SCENES.REGISTRATION);
}
