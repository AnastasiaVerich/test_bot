import * as turf from "@turf/turf";
import {
  getAllRegions,
  RegionSettings,
} from "../database/queries/regionQueries";
import {LocationType} from "../server/types/type";

export async function findRegionByLocation(
  location_coordinate: LocationType,
): Promise<RegionSettings | null> {
  if (
    typeof location_coordinate.latitude !== "number" ||
    typeof location_coordinate.longitude !== "number"
  ) {
    throw new Error("Invalid type provided");
  }

  try {
    const regionsSettings: RegionSettings[] = await getAllRegions();

    // Переменная для хранения найденного региона
    let region: RegionSettings | null = null;

    for (const regionSetting of regionsSettings) {
      // Полигон региона в формате GeoJSON
      const polygonArray = Object.values(regionSetting.polygon);
      const polygon = turf.polygon([polygonArray]);

      // Точка местоположения пользователя в формате GeoJSON
      const point = turf.point([
        location_coordinate.latitude,
        location_coordinate.longitude,
      ]);

      // Проверяем, находится ли точка внутри полигона региона
      if (turf.booleanPointInPolygon(point, polygon)) {
        region = regionSetting;
        break;
      }
    }

    return region;
  } catch (error) {

    throw new Error("Error findRegionByLocation: " + error);
  }
}
