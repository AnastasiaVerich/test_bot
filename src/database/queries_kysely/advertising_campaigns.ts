import { AdvertisingCampaignsType } from "../db-types";
import { pool, poolType } from "../dbClient";

export async function addAdvertisingCampaign(
  params: {
    name: AdvertisingCampaignsType["name"];
    referral_link: AdvertisingCampaignsType["referral_link"];
  },
  trx: poolType = pool,
): Promise<AdvertisingCampaignsType["id"] | null> {
  try {
    const { name, referral_link } = params;
    const result = await trx
      .insertInto("advertising_campaigns")
      .values({
        name: name,
        referral_link: referral_link,
      })
      .returning("id")
      .executeTakeFirst();

    return result?.id ?? null;
  } catch (error) {
    throw new Error("Error addAdvertisingCampaign: " + error);
  }
}
export async function getAdvertisingCampaign(
  params: {
    id?: AdvertisingCampaignsType["id"];
    name?: AdvertisingCampaignsType["name"];
    referral_link?: AdvertisingCampaignsType["referral_link"];
  },
  trx: poolType = pool,
): Promise<AdvertisingCampaignsType | null> {
  try {
    const { id, name, referral_link } = params;

    if (id === undefined && name === undefined && referral_link === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .selectFrom("advertising_campaigns")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (id !== undefined) {
          conditions.push(eb("id", "=", id));
        }
        if (name !== undefined) {
          conditions.push(eb("name", "=", name));
        }
        if (referral_link !== undefined) {
          conditions.push(eb("referral_link", "=", referral_link));
        }
        return eb.or(conditions);
      })

      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error addAdvertisingCampaign: " + error);
  }
}
