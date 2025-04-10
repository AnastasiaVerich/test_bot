import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { LocationType, MyContext } from "../../../types/type";
import { RegionSettings } from "../../../../database/queries/regionQueries";
import { SURVEY_SCENE } from "../../../constants/scenes";
import { BUTTONS_KEYBOARD } from "../../../constants/button";
import { AuthUserKeyboard } from "../../../../bot-user/keyboards/AuthUserKeyboard";
import { findRegionByLocation } from "../../../../utils/regionUtils";

export async function regionState(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<RegionSettings | null> {
  await ctx.reply(SURVEY_SCENE.INPUT_LOCATION, {
    reply_markup: new Keyboard()
      .requestLocation(BUTTONS_KEYBOARD.GeolocationButton)
      .resized()
      .oneTime(),
  });

  const message = await conversation.waitFor("message:location");

  const location: LocationType = message.message?.location;

  if (!location || !location.latitude || !location.longitude) {
    await ctx.reply(SURVEY_SCENE.LOCATION_FAILED, {
      reply_markup: AuthUserKeyboard(),
    });
    return null;
  }

  const region = await findRegionByLocation(location);

  if (!region) {
    await ctx.reply(SURVEY_SCENE.REGION_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  }
  return region;
}
