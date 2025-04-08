import { MyContext } from "../../../types/type";
import { RegionSettings } from "../../../../database/queries/regionQueries";
import {
  getOperatorsByRegionAndStatus,
  Operator,
} from "../../../../database/queries/operatorQueries";
import { SURVEY_SCENE } from "../../../constants/scenes";
import { AuthUserKeyboard } from "../../../../bot-user/keyboards/AuthUserKeyboard";

export async function searchOperatorStep(
  ctx: MyContext,
  region: RegionSettings,
): Promise<Operator | null> {
  const freeOperator = await getOperatorsByRegionAndStatus(
    region.region_id,
    "free",
  );
  if (freeOperator.length === 0) {
    await ctx.reply(SURVEY_SCENE.OPERATOR_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
    return null;
  }
  return freeOperator[0];
}
