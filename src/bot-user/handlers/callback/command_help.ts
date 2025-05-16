import { MyContext } from "../../../bot-common/types/type";
import { HelpKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { COMMAND_USER_HELP } from "../../../bot-common/constants/handler_command";

export const handleHelpCommand = async (ctx: MyContext) => {
  try {
    await ctx.reply(COMMAND_USER_HELP.HEADER, {
      parse_mode: "HTML",
      reply_markup: HelpKeyboard(),
    });
  } catch (error) {
    await ctx.reply(COMMAND_USER_HELP.SOME_ERROR);
  }
};
