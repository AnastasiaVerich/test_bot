import {SCENES} from "../../constants/constants";

import {MyContext} from "../../types/type";

export async function handleRegistration(ctx: MyContext) {
    await ctx.conversation.enter(SCENES.REGISTRATION);
}
