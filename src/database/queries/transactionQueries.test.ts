import { db } from "../dbClient";
import {
  createTransaction,
  updateTransactionStatus,
  getPendingTransactions,
} from "./transactionQueries";

jest.mock("../dbClient");

describe("Transaction Queries", () => {
  describe("createTransaction", () => {
    // Проверяем, что транзакция создается успешно
    it("Should create a transaction successfully", async () => {
      const mockTransaction = {
        user_id: 12345,
        amount: 100,
        status: "pending",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockTransaction],
      });

      const result = await createTransaction(12345, 100, "pending");
      expect(result).toEqual(mockTransaction);
      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3) RETURNING *`,
        [12345, 100, "pending"],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(createTransaction(12345, 100, "pending")).rejects.toThrow(
        "Error createTransaction: Database error",
      );
    });
  });

  describe("updateTransactionStatus", () => {
    // Проверяем, что статус транзакции обновляется успешно
    it("Should update transaction status successfully", async () => {
      const mockTransaction = {
        user_id: 12345,
        amount: 100,
        status: "completed",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockTransaction],
      });

      const result = await updateTransactionStatus(1, "completed");
      expect(result).toEqual(mockTransaction);
      expect(db.query).toHaveBeenCalledWith(
        `UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        ["completed", 1],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(updateTransactionStatus(1, "completed")).rejects.toThrow(
        "Error updateTransactionStatus: Database error",
      );
    });
  });

  describe("getPendingTransactions", () => {
    // Проверяем, что возвращаются все транзакции со статусом "pending"
    it("Should retrieve all pending transactions", async () => {
      const mockTransactions = [
        { user_id: 12345, amount: 100, status: "pending" },
        { user_id: 67890, amount: 200, status: "pending" },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockTransactions });

      const result = await getPendingTransactions();
      expect(result).toEqual(mockTransactions);
      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM transactions WHERE status = 'pending'`,
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getPendingTransactions()).rejects.toThrow(
        "Error getPendingTransactions: Database error",
      );
    });
  });
});
