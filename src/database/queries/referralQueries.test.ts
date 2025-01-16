import { addReferral } from "./referralQueries";
import { db } from "../dbClient";

jest.mock("../dbClient");

describe("addReferral", () => {
  //Проверьте, что данные корректно добавляются в базу
  it("should add referral and return the created record", async () => {
    const mockReferral = {
      tg_user_id: 12345,
      referral_creator_id: 67890,
      created_at: "2022-01-01T00:00:00Z",
    };

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockReferral] });

    const result = await addReferral(12345, 67890);
    expect(result).toEqual(mockReferral);
    expect(db.query).toHaveBeenCalledWith(
      `INSERT INTO referral_bot_starts (tg_user_id, referral_creator_id) 
                    VALUES ($1, $2)
                    ON CONFLICT (tg_user_id) DO NOTHING
                    RETURNING *`,
      [12345, 67890],
    );
  });

  //Проверяем, что функция выбрасывает ошибку если запрос падает
  it("should throw an error if query fails", async () => {
    const error = new Error("Database error");
    (db.query as jest.Mock).mockRejectedValueOnce(error);

    await expect(addReferral(12345, 67890)).rejects.toThrow(
      "Error addReferral: Database error",
    );
  });

  //Проверяем, что функция выбрасывает ошибку при невалидных данных
  it("should throw an error if inputs are not numbers", async () => {
    await expect(addReferral("abc" as any, 67890)).rejects.toThrow(
      "Invalid type provided",
    );
    await expect(addReferral(12345, "def" as any)).rejects.toThrow(
      "Invalid type provided",
    );
  });
});
