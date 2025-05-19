import { MyContext } from "../../../bot-common/types/type";
import { HelpKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { COMMAND_USER_HELP } from "../../../bot-common/constants/handler_command";
import { addUserLogs } from "../../../database/queries_kysely/bot_user_logs";
import { getUserId } from "../../../bot-common/utils/getUserId";

export const handleHelpCommand = async (ctx: MyContext) => {
  try {
    const userId = await getUserId(ctx);
    if (!userId) return;

    await addUserLogs({
      user_id: userId,
      event_type: "help",
      event_data: `{}`,
    });

    await ctx.reply(COMMAND_USER_HELP.HEADER, {
      parse_mode: "HTML",
      reply_markup: HelpKeyboard(),
    });
  } catch (error) {
    await ctx.reply(COMMAND_USER_HELP.SOME_ERROR);
  }
};
