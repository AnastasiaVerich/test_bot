// /*
// import { Request, Response } from "express";
// import { Readable } from "stream";
// import * as fs from "node:fs";
// import { checkExistInBlockUser } from "../../../database/queries/blacklistUsersQueries";
// import {identificationScene} from "../../../bot-user/scenes/identification";
//
// // Мокаем зависимости
// jest.mock("../../services/embeddingService");
// jest.mock("../../../database/queries/blacklistUsersQueries");
// jest.mock("../../../database/queries/operatorQueries");
// jest.mock("../../../database/queries/faceEmbeddingsQueries");
// jest.mock("../../../database/queries/faceEmbeddingsQueries");
//
// describe("identification", () => {
//   jest.spyOn(console, "warn").mockImplementation(() => {}); // Отключает все предупреждения
//
//   let mockReq: Partial<Request>;
//   let mockRes: Partial<Response>;
//   const imageBuffer = fs.readFileSync("./tests/assets/images.jpg");
//   beforeEach(() => {
//     mockReq = {
//       body: {
//         userId: "123",
//       },
//       file: {
//         buffer: imageBuffer,
//         fieldname: "",
//         originalname: "",
//         encoding: "",
//         mimetype: "",
//         size: 0,
//         stream: new Readable(),
//         destination: "",
//         filename: "",
//         path: "",
//       },
//     };
//     mockRes = {
//       status: jest.fn().mockReturnThis(),
//       send: jest.fn(),
//     };
//
//     jest.clearAllMocks();
//   });
//
//   // Проверка: отсутствует файл
//   it("should return 400 if file is missing", async () => {
//     mockReq.file = undefined;
//
//     await identificationScene(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(400);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "missing_photo",
//     });
//   });
//
//   // Проверка: отсутствует userId
//   it("should return 400 if userId is missing or invalid", async () => {
//     mockReq.body.userId = undefined;
//
//     await identificationScene(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(400);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "missing_user_id",
//     });
//   });
//
//   // Проверка: пользователь в блоке или оператор
//   it("should return 200 with user_is_block if user is blocked or an operator", async () => {
//     (checkExistInBlockUser as jest.Mock).mockResolvedValue(true);
//
//     await identificationScene(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 0,
//       text: "user_is_block",
//     });
//   });
//
//   // // Проверка: успешная идентификация
//   // it("should return 200 with success if face embedding matches", async () => {
//   //   jest.isolateModules(async () => {
//   //     const faceapi = await import("@vladmandic/face-api");
//   //     jest.spyOn(faceapi, "euclideanDistance").mockReturnValue(0.5);
//   //
//   //     const mockEmbeddingFromDB = {
//   //       embedding: JSON.stringify([0.1, 0.2, 0.3]),
//   //     };
//   //     (embeddingService.detectFaces as jest.Mock).mockResolvedValue([
//   //       { descriptor: [0.1, 0.2, 0.3] },
//   //     ]);
//   //     (getFaceEmbeddingByUserId as jest.Mock).mockResolvedValue(
//   //       mockEmbeddingFromDB,
//   //     );
//   //
//   //     await identification(mockReq as Request, mockRes as Response);
//   //
//   //     expect(mockRes.status).toHaveBeenCalledWith(200);
//   //     expect(mockRes.send).toHaveBeenCalledWith({ status: 1, text: "success" });
//   //   });
//   // });
//   //
//   // // Проверка: идентификация не удалась
//   // it("should return 200 with similarity_not_confirmed if face embedding does not match", async () => {
//   //   jest.isolateModules(async () => {
//   //     const faceapi = await import("@vladmandic/face-api");
//   //     jest.spyOn(faceapi, "euclideanDistance").mockReturnValue(0.7);
//   //
//   //     const mockEmbeddingFromDB = {
//   //       embedding: JSON.stringify([0.1, 0.2, 0.3]),
//   //     };
//   //     (embeddingService.detectFaces as jest.Mock).mockResolvedValue([
//   //       { descriptor: [0.4, 0.5, 0.6] },
//   //     ]);
//   //     (getFaceEmbeddingByUserId as jest.Mock).mockResolvedValue(
//   //       mockEmbeddingFromDB,
//   //     );
//   //
//   //     await identification(mockReq as Request, mockRes as Response);
//   //
//   //     expect(mockRes.status).toHaveBeenCalledWith(200);
//   //     expect(mockRes.send).toHaveBeenCalledWith({
//   //       status: 0,
//   //       text: "similarity_not_confirmed",
//   //     });
//   //   });
//   // });
//
//   // Проверка: ошибка сервера
//   it("should return 500 with server_error if an exception is thrown", async () => {
//     (checkExistInBlockUser as jest.Mock).mockImplementation(() => {
//       throw new Error("Unexpected error");
//     });
//
//     await identificationScene(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(500);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "server_error",
//     });
//   });
// });
// */
