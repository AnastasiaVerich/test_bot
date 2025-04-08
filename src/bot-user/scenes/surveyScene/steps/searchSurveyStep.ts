import { MyContext } from "../../../types/type";
import { RegionSettings } from "../../../../database/queries/regionQueries";
import {
  findAvailableSurvey,
  getRecentSurveyTypesForUser,
  Survey,
} from "../../../../database/queries/surveyQueries";
import { SURVEY_SCENE } from "../../../constants/scenes";
import { AuthUserKeyboard } from "../../../../bot-user/keyboards/AuthUserKeyboard";

export async function searchSurveyStep(
  ctx: MyContext,
  userId: number,
  region: RegionSettings,
): Promise<Survey | null> {
  // Достать темы, которые оператор проходил последние XX дней
  const recentSurveyTypes = await getRecentSurveyTypesForUser(
    userId,
    region.query_similar_topic_days,
  );

  //Найти опрос, который не соотвествует темам, которые пользователь уже проходил, который находится в этом регионе
  const survey = await findAvailableSurvey(
    userId,
    region.region_id,
    recentSurveyTypes,
  );

  if (!survey) {
    await ctx.reply(SURVEY_SCENE.SURVEY_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  }
  return survey;
}
