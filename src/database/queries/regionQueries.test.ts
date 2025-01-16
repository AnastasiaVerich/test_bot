import { db } from "../dbClient";
import { getAllRegions, RegionSettings } from "./regionQueries";

jest.mock("../dbClient");
jest.mock("@turf/turf");

describe("Region Queries", () => {
  describe("getAllRegions", () => {
    it("Should return all region settings", async () => {
      const mockRegions: RegionSettings[] = [
        {
          region_id: 1,
          region_name: "Region A",
          reservation_time_min: 30,
          query_frequency_days: 7,
          query_similar_topic_days: 3,
          polygon: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
              ],
            ],
          },
          created_at: "2022-01-01T00:00:00Z",
          updated_at: "2022-01-01T00:00:00Z",
        },
        {
          region_id: 2,
          region_name: "Region B",
          reservation_time_min: 45,
          query_frequency_days: 10,
          query_similar_topic_days: 5,
          polygon: {
            type: "Polygon",
            coordinates: [
              [
                [1, 1],
                [1, 2],
                [2, 2],
                [2, 1],
                [1, 1],
              ],
            ],
          },
          created_at: "2022-01-02T00:00:00Z",
          updated_at: "2022-01-02T00:00:00Z",
        },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockRegions });

      const result = await getAllRegions();
      expect(result).toEqual(mockRegions);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM region_settings");
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getAllRegions()).rejects.toThrow(
        "Error getAllRegions: Database error",
      );
    });
  });
});
