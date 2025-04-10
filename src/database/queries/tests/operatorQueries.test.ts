/*
import { db } from "../dbClient";
import {
  getOperatorsByRegionAndStatus,
  findOperatorByTelegramId,
  updateOperatorStatus,
  Operator,
} from "./operatorQueries";

jest.mock("../dbClient");

describe("Operators Queries", () => {
  describe("getOperatorsByRegionAndStatus", () => {
    it("Should return operators filtered by region and status", async () => {
      const mockOperators: Operator[] = [
        {
          operator_id: 1,
          tg_account: "operator1",
          phone: "1234567890",
          status: "free",
          created_at: "2022-01-01T00:00:00Z",
        },
        {
          operator_id: 2,
          tg_account: "operator2",
          phone: "0987654321",
          status: "free",
          created_at: "2022-01-02T00:00:00Z",
        },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockOperators });

      const result = await getOperatorsByRegionAndStatus(1, "free");
      expect(result).toEqual(mockOperators);
      expect(db.query).toHaveBeenCalledWith(
        `
          SELECT *
            FROM operators o
            JOIN operators_regions orr ON o.operator_id = orr.operator_id
            WHERE orr.region_id = $1 AND o.status = $2;
        `,
        [1, "free"],
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getOperatorsByRegionAndStatus(1, "free")).rejects.toThrow(
        "Error getOperatorByRegionAndStatus: Database error",
      );
    });
  });

  describe("findOperatorByTelegramId", () => {
    it("Should return an operator when at least one valid field is provided", async () => {
      const mockOperator: Operator = {
        operator_id: 1,
        tg_account: "operator1",
        phone: "1234567890",
        status: "busy",
        created_at: "2022-01-01T00:00:00Z",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockOperator] });

      const result = await findOperatorByTelegramId(1, null, null);
      expect(result).toEqual(mockOperator);
      expect(db.query).toHaveBeenCalledWith(
        `
           SELECT 1
           FROM operators
           WHERE operator_id = $1 OR phone = $2 OR tg_account = $3
            ;`,
        [1, null, null],
      );
    });

    it("Should throw an error if no parameters are provided", async () => {
      await expect(findOperatorByTelegramId(null, null, null)).rejects.toThrow(
        "At least one of accountId or phoneNumber must be provided.",
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(findOperatorByTelegramId(1, null, null)).rejects.toThrow(
        "Error findOperatorByTelegramId: Database error",
      );
    });
  });

  describe("updateOperatorStatus", () => {
    it("Should update the status of the operator", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await updateOperatorStatus(1, "busy");
      expect(db.query).toHaveBeenCalledWith(
        `
        UPDATE operators
        SET status = $1
        WHERE operator_id = $2;
    `,
        ["busy", 1],
      );
    });

    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(updateOperatorStatus(1, "free")).rejects.toThrow(
        "Error findOperatorByTelegramId: Database error",
      );
    });
  });
});
*/
