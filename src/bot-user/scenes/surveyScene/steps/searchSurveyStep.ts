import { MyContext } from "../../../types/type";
import { RegionSettings } from "../../../../database/queries/regionQueries";
import {
  getAvailableSurveyForRegion,
  Survey,
} from "../../../../database/queries/surveyQueries";
import { SURVEY_SCENE } from "../../../constants/scenes";
import { AuthUserKeyboard } from "../../../keyboards/AuthUserKeyboard";

export async function searchSurveyStep(
  ctx: MyContext,
  userId: number,
  region: RegionSettings,
): Promise<{ surveyId: number } | null> {
  const survey = await getAvailableSurveyForRegion(region.region_id);


  if (!survey) {
    await ctx.reply(SURVEY_SCENE.SURVEY_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  }

  return survey
}
