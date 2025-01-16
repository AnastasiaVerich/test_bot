import { db } from "../dbClient";
import {
  selectWithdrawalLogByUserId,
  addWithdrawalLog,
} from "./withdrawalLogsQueries";

jest.mock("../dbClient");

describe("Withdrawal Logs", () => {
  describe("selectWithdrawalLogByUserId", () => {
    it("Should return withdrawal logs for a valid user ID", async () => {
      const mockWithdrawalLogs = [
        {
          withdrawal_id: 1,
          user_id: 100,
          amount: 50,
          wallet: "wallet123",
          withdrawn_at: "2025-01-01T00:00:00Z",
        },
        {
          withdrawal_id: 2,
          user_id: 100,
          amount: 75,
          wallet: "wallet123",
          withdrawn_at: "2025-01-02T00:00:00Z",
        },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: mockWithdrawalLogs,
      });

      const result = await selectWithdrawalLogByUserId(100);

      expect(result).toEqual(mockWithdrawalLogs);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM withdrawal_logs WHERE user_id = $1",
        [100],
      );
    });

    it("Should throw an error if user ID is invalid", async () => {
      await expect(
        selectWithdrawalLogByUserId("invalid" as any),
      ).rejects.toThrow("Invalid type provided");
    });

    it("Should throw an error if database query fails", async () => {
      const error = new Error("Database error");

      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(selectWithdrawalLogByUserId(100)).rejects.toThrow(
        "Error selectWithdrawalLogByUserId: Database error",
      );
    });
  });

  describe("addWithdrawalLog", () => {
    it("Should insert a new withdrawal log successfully", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce(undefined);

      await addWithdrawalLog(100, 50, "wallet123");

      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO withdrawal_logs (user_id, amount, wallet, withdrawn_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
        [100, 50, "wallet123"],
      );
    });

    it("Should throw an error if database query fails", async () => {
      const error = new Error("Database error");

      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(addWithdrawalLog(100, 50, "wallet123")).rejects.toThrow(
        "Error addWithdrawalLog: Database error",
      );
    });
  });
});
