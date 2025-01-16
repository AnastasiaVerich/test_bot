import { db } from "../dbClient";
import {
  checkBalance,
  addUserBalance,
  updateUserBalance,
} from "./balanceQueries";

jest.mock("../dbClient");

describe("Balance Queries", () => {
  describe("checkBalance", () => {
    // Проверяем, что функция возвращает баланс пользователя, если он существует
    it("Should return user balance if they exist", async () => {
      const mockBalance = {
        user_id: 12345,
        balance: 100,
        total_earned: 500,
        total_withdrawn: 400,
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockBalance] });

      const balance = await checkBalance(12345);
      expect(balance).toEqual(mockBalance);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM user_balance WHERE user_id = $1",
        [12345],
      );
    });

    // Проверяем, что функция возвращает null, если запись не найдена
    it("Should return null if no balance record exists", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const balance = await checkBalance(12345);
      expect(balance).toBeNull();
    });

    // Проверяем, что функция выбрасывает ошибку при некорректном типе userId
    it("Should throw an error if userId is not a number", async () => {
      await expect(checkBalance("not-a-number" as any)).rejects.toThrow(
        "Invalid type provided",
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос падает
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(checkBalance(12345)).rejects.toThrow(
        "Error checkBalance: Database error",
      );
    });
  });

  describe("addUserBalance", () => {
    // Проверяем, что запись баланса добавляется в базу данных
    it("Should successfully add user balance", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await addUserBalance(12345, 100, 500, 400);

      expect(db.query).toHaveBeenCalledWith(
        `
            INSERT INTO user_balance (user_id, balance, total_earned, total_withdrawn)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
        [12345, 100, 500, 400],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос падает
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(addUserBalance(12345, 100, 500, 400)).rejects.toThrow(
        "Error addUserBalance: Database error",
      );
    });
  });

  describe("updateUserBalance", () => {
    // Проверяем, что баланс пользователя успешно обновляется
    it("Should successfully update user balance", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await updateUserBalance(12345, 50);

      expect(db.query).toHaveBeenCalledWith(
        `UPDATE user_balance SET balance = balance - $1 WHERE userId = $2`,
        [50, 12345],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос падает
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(updateUserBalance(12345, 50)).rejects.toThrow(
        "Error updateUserBalance: Database error",
      );
    });
  });
});
