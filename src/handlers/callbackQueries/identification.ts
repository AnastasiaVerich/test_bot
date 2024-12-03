import {SCENES} from "../../constants/constants";

import {MyContext} from "../../types/type";

export async function handleIdentification(ctx: MyContext) {
    await ctx.conversation.enter(SCENES.IDENTIFICATION);
}
