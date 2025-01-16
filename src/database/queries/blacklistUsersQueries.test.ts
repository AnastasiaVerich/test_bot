import { db } from "../dbClient";
import { checkExistInBlockUser } from "./blacklistUsersQueries";

jest.mock("../dbClient");

describe("Blacklist Queries", () => {
  describe("checkExistInBlockUser", () => {
    // Проверяем, что функция возвращает данные, если пользователь существует
    it("Should return a blacklist user if they exist", async () => {
      const mockBlacklistUser = {
        blacklist_id: 1,
        account_id: 12345,
        phone: "1234567890",
        reason: "Violation of terms",
        added_at: "2022-01-01T00:00:00Z",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockBlacklistUser],
      });

      const result = await checkExistInBlockUser(12345, null);
      expect(result).toEqual(mockBlacklistUser);
      expect(db.query).toHaveBeenCalledWith(
        `
            SELECT 1 FROM blacklist_users WHERE account_id = $1 OR phone = $2 LIMIT 1;`,
        [12345, null],
      );
    });

    // Проверяем, что функция возвращает данные, если пользователь существует по телефону
    it("Should return a blacklist user if phone exists", async () => {
      const mockBlacklistUser = {
        blacklist_id: 1,
        account_id: null,
        phone: "1234567890",
        reason: "Spam activity",
        added_at: "2022-01-01T00:00:00Z",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockBlacklistUser],
      });

      const result = await checkExistInBlockUser(null, "1234567890");
      expect(result).toEqual(mockBlacklistUser);
      expect(db.query).toHaveBeenCalledWith(
        `
            SELECT 1 FROM blacklist_users WHERE account_id = $1 OR phone = $2 LIMIT 1;`,
        [null, "1234567890"],
      );
    });

    // Проверяем, что функция возвращает undefined, если запись не найдена
    it("Should return undefined if no blacklist user exists", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await checkExistInBlockUser(12345, "1234567890");
      expect(result).toBeUndefined();
    });

    // Проверяем, что функция выбрасывает ошибку, если не переданы ни accountId, ни phoneNumber
    it("Should throw an error if neither accountId nor phoneNumber is provided", async () => {
      await expect(checkExistInBlockUser(null, null)).rejects.toThrow(
        "At least one of accountId or phoneNumber must be provided.",
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос падает
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(checkExistInBlockUser(12345, "1234567890")).rejects.toThrow(
        "Error checkExistInBlockUser: Database error",
      );
    });
  });
});
