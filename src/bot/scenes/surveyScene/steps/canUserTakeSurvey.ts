import { MyContext } from "../../../types/type";
import { User } from "../../../../database/queries/userQueries";
import { SURVEY_SCENE } from "../../../constants/scenes";
import { AuthUserKeyboard } from "../../../keyboards/AuthUserKeyboard";
import { formatTimestamp } from "../../../../lib/date";

export async function canTakeSurvey(
  ctx: MyContext,
  nowDateTime: Date,
  user: User,
): Promise<boolean> {
  let isAllowed = true;
  if (user.status === "busy") {
    await ctx.reply(SURVEY_SCENE.USER_BUSY, {
      reply_markup: AuthUserKeyboard(),
    });
    isAllowed = false;
  }

  if (
    user.survey_lock_until &&
    Number(new Date(user.survey_lock_until)) > Number(nowDateTime)
  ) {
    await ctx.reply(
      `${SURVEY_SCENE.USER_CANT_SURVEY} ${formatTimestamp(Number(new Date(user.survey_lock_until)))}`,
      {
        reply_markup: AuthUserKeyboard(),
      },
    );

    isAllowed = false;
  }
  return isAllowed;
}
