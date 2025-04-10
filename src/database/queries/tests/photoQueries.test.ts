// import { db } from "../../dbClient";
// import { addPhoto } from "../photoQueries";
//
// jest.mock("../../dbClient");
//
// describe("Photo Queries", () => {
//   describe("addPhoto", () => {
//     // Проверяем успешное добавление фотографии
//     it("Should successfully add a photo", async () => {
//       (db.query as jest.Mock).mockResolvedValueOnce({}); // Имитируем успешное выполнение запроса
//
//       const mockUserId = 1;
//       const mockImage = Buffer.from("mockImageData");
//
//       await addPhoto(mockUserId, mockImage);
//
//       expect(db.query).toHaveBeenCalledWith(
//         "INSERT INTO photos (user_id, image) VALUES ($1, $2)",
//         [mockUserId, mockImage],
//       );
//     });
//
//     // Проверяем обработку ошибки при сбое запроса
//     it("Should throw an error if query fails", async () => {
//       (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
//
//       const mockUserId = 1;
//       const mockImage = Buffer.from("mockImageData");
//
//       await expect(addPhoto(mockUserId, mockImage)).rejects.toThrow(
//         "Error addPhoto: DB Error",
//       );
//     });
//   });
// });
