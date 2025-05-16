import { pool, poolType } from "../dbClient";
import { RegionSettingsType } from "../db-types";

export async function getAllRegions(
  trx: poolType = pool,
): Promise<RegionSettingsType[]> {
  try {
    const result = await trx
      .selectFrom("region_settings")
      .selectAll()
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllRegions: " + error);
  }
}

export async function getRegionById(
  regionId: RegionSettingsType["region_id"],
  trx: poolType = pool,
): Promise<RegionSettingsType | null> {
  try {
    const result = await trx
      .selectFrom("region_settings")
      .selectAll()
      .where("region_id", "=", regionId)
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getRegionById: " + error);
  }
}
