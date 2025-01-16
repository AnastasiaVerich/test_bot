import { findRegionByLocation } from "./regionUtils";
import { getAllRegions } from "../database/queries/regionQueries";
import { LocationType } from "../bot/types/type";
import { RegionSettings } from "../database/queries/regionQueries";

// Мокаем функцию getAllRegions
jest.mock("../database/queries/regionQueries", () => ({
  getAllRegions: jest.fn(),
}));

describe("findRegionByLocation", () => {
  const mockRegions: RegionSettings[] = [
    {
      region_id: 1,
      region_name: "Region 1",
      polygon: { 0: [0, 0], 1: [0, 10], 2: [10, 10], 3: [10, 0], 4: [0, 0] },
      reservation_time_min: 10,
      query_similar_topic_days: 7,
      query_frequency_days: 0,
      created_at: "",
      updated_at: "",
    },
    {
      region_id: 2,
      region_name: "Region 2",
      polygon: {
        0: [20, 20],
        1: [20, 30],
        2: [30, 30],
        3: [30, 20],
        4: [20, 20],
      },
      reservation_time_min: 20,
      query_similar_topic_days: 14,
      query_frequency_days: 0,
      created_at: "",
      updated_at: "",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getAllRegions as jest.Mock).mockResolvedValue(mockRegions);
  });

  // Проверка: точка внутри региона
  it("should return the correct region when the point is inside a region", async () => {
    const location_coordinate: LocationType = { latitude: 5, longitude: 5 };

    const result = await findRegionByLocation(location_coordinate);

    expect(result).toBeDefined();
    expect(result?.region_id).toBe(1);
    expect(result?.region_name).toBe("Region 1");
  });

  // Проверка: точка не попадает ни в один регион
  it("should return null when the point is outside all regions", async () => {
    const location_coordinate: LocationType = { latitude: 15, longitude: 15 };

    const result = await findRegionByLocation(location_coordinate);

    expect(result).toBeNull();
  });

  // Проверка: некорректные входные данные
  it("should throw an error when the location has invalid coordinates", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const invalidLocation: LocationType = { latitude: null, longitude: null };

    await expect(findRegionByLocation(invalidLocation)).rejects.toThrow(
      "Invalid type provided",
    );
  });

  // Проверка: ошибка при получении регионов
  it("should throw an error when getAllRegions fails", async () => {
    (getAllRegions as jest.Mock).mockRejectedValue(new Error("DB error"));

    const location_coordinate: LocationType = { latitude: 5, longitude: 5 };

    await expect(findRegionByLocation(location_coordinate)).rejects.toThrow(
      "Error findRegionByLocation: DB error",
    );
  });

  // Проверка: точка находится на границе полигона
  it("should return the region when the point is on the boundary of a region", async () => {
    const location_coordinate: LocationType = { latitude: 0, longitude: 0 };

    const result = await findRegionByLocation(location_coordinate);

    expect(result).toBeDefined();
    expect(result?.region_id).toBe(1);
  });

  // Проверка: пустой массив регионов
  it("should return null when no regions are available", async () => {
    (getAllRegions as jest.Mock).mockResolvedValue([]);

    const location_coordinate: LocationType = { latitude: 5, longitude: 5 };

    const result = await findRegionByLocation(location_coordinate);

    expect(result).toBeNull();
  });
});
