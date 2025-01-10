import { db } from "../dbClient";
import {
  addUser,
  findUserByPhone,
  findUserByTelegramId,
  updateUserLastInit,
  updateUserStatus,
} from "./userQueries";

jest.mock("../dbClient");
describe("User Queries", () => {
  describe("findUserByTelegramId", () => {
    // Проверяем, что возвращается нужный пользователь и вызывается корректный зарпос
    it("Should return user if they exist", async () => {
      const mockUser = {
        user_id: 12345,
        phone: "1234567890",
        survey_lock_until: null,
        status: "free",
        created_at: "2022-01-01T00:00:00Z",
        last_init: "2022-01-02T00:00:00Z",
        updated_at: "2022-01-03T00:00:00Z",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const user = await findUserByTelegramId(12345);
      expect(user).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE user_id = $1",
        [12345],
      );
    });

    //Проверяем, что функция выбрасывает ошибку если запрос падает
    it("Should throw an error if query fails.", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(findUserByTelegramId(12345)).rejects.toThrow(
        "Error findUserByTelegramId: Error: Database error",
      );
    });

    //Проверяем, что функция выбрасывает ошибку при невалидном telegramId
    it("should throw an error if telegramId is not a number", async () => {
      await expect(findUserByTelegramId("not-a-number" as any)).rejects.toThrow(
        "Invalid type provided",
      );
    });
  });

  describe("findUserByPhone", () => {
    // Проверяем, что возвращается нужный пользователь по номеру телефона
    it("Should return user if they exist", async () => {
      const mockUser = {
        user_id: 12345,
        phone: "1234567890",
        survey_lock_until: null,
        status: "free",
        created_at: "2022-01-01T00:00:00Z",
        last_init: "2022-01-02T00:00:00Z",
        updated_at: "2022-01-03T00:00:00Z",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const user = await findUserByPhone("1234567890");
      expect(user).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE phone = $1",
        ["1234567890"],
      );
    });

    // Проверяем, что функция выбрасывает ошибку если запрос падает
    it("Should throw an error if query fails.", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(findUserByPhone("1234567890")).rejects.toThrow(
        "Error findUserByPhone: Error: Database error",
      );
    });

    // Проверяем, что функция выбрасывает ошибку при невалидном типе телефона
    it("should throw an error if phone is not a string", async () => {
      await expect(findUserByPhone(1234567890 as any)).rejects.toThrow(
        "Invalid type provided",
      );
    });
  });

  describe("addUser", () => {
    // Проверяем, что пользователь добавляется в базу данных
    it("Should successfully add a user", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await addUser(12345, "1234567890");

      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO users (user_id, phone, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [12345, "1234567890"],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(addUser(12345, "1234567890")).rejects.toThrow(
        "Error addUser: Error: Database error",
      );
    });
  });

  describe("updateUserStatus", () => {
    // Проверяем, что статус пользователя успешно обновляется
    it("Should successfully update the user status", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await updateUserStatus(12345, "busy");

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE users SET status = $1, updated_at = NOW() WHERE user_id = $2;",
        ["busy", 12345],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(updateUserStatus(12345, "busy")).rejects.toThrow(
        "Error updateUserStatus: Error: Database error",
      );
    });
  });

  describe("updateUserLastInit", () => {
    // Проверяем, что время последней инициализации пользователя обновляется успешно
    it("Should successfully update the user's last initialization time", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      await updateUserLastInit(12345);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE users SET last_init = NOW(), updated_at = NOW() WHERE user_id = $1;",
        [12345],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(updateUserLastInit(12345)).rejects.toThrow(
        "Error updateUserLastInit: Error: Database error",
      );
    });
  });
});
