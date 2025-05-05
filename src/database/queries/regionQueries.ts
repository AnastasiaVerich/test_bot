import { QueryResult } from "pg";
import { db } from "../dbClient";

export interface RegionSettings {
  region_id: number;
  region_name: string;
  reservation_time_min: number; // Время резервации задания для региона
  survey_interval: string; //
  polygon: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  created_at: string; // Дата и время в ISO формате
}

export async function getAllRegions(): Promise<RegionSettings[]> {
  try {
    const query = "SELECT * FROM region_settings";
    const result: QueryResult<RegionSettings> = await db.query(query);
    return result.rows;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getAllRegions: " + shortError);
  }
}

export async function getRegionById(
    region_id: number
): Promise<RegionSettings | undefined> {
  try {
    const query = "SELECT * FROM region_settings WHERE region_id = $1";
    const result: QueryResult<RegionSettings> = await db.query(query, [region_id]);
    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getRegionById: " + shortError);
  }
}
