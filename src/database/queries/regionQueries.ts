import {db} from "../dbClient";
import {QueryResult} from "pg";
import {LocationType} from "../../types/type";
import * as turf from '@turf/turf';

interface RegionSettings {
    region_id: number;
    region_name: string;
    reservation_time_min: number;  // Время резервации задания для региона
    query_frequency_days: number;  // Частота прохождения запроса для региона
    query_similar_topic_days: number;  // Количество дней для похожей тематики по региону
    polygon: Record<string, any>;  // Полигон в формате JSON
    created_at: string;  // Дата и время в ISO формате
    updated_at: string;  // Дата и время в ISO формате
}

export async function findRegionByLocation(location: LocationType):Promise<RegionSettings| null> {

    if (!location.latitude || !location.longitude) {
        throw new Error('Invalid type provided');
    }

    try {

        const regionsSettings:  RegionSettings[]= await getAllRegions();

        // Переменная для хранения найденного региона
        let region: RegionSettings | null = null

        for (const regionSetting of regionsSettings) {
            // Полигон региона в формате GeoJSON
            const polygonArray = Object.values(regionSetting.polygon);
            const polygon = turf.polygon([polygonArray]);

            // Точка местоположения пользователя в формате GeoJSON
            const point = turf.point([location.latitude, location.longitude]);

            // Проверяем, находится ли точка внутри полигона региона
            if (turf.booleanPointInPolygon(point, polygon)) {
                region = regionSetting;
                break;
            }
        }

        return region;



    } catch (error) {
        console.log('Error findRegionByLocation:', error);
        throw new Error('Error findRegionByLocation');
    }
}

export async function getAllRegions():Promise<RegionSettings[]> {

    try {
        const query = 'SELECT * FROM region_settings';
        const result: QueryResult<RegionSettings> = await db.query(query);
        return result.rows;
    } catch (error) {
        console.log('Error getAllRegions:', error);
        throw new Error('Error getAllRegions');
    }
}
