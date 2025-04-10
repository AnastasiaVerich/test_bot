// import { Request, Response } from "express";
// import fs from "node:fs";
// import { Readable } from "stream";
// import { registration } from "./registration";
// import * as dbClient from "../../../database/dbClient";
// import * as userQueries from "../../../database/queries/userQueries";
// import * as embeddingService from "../../services/embeddingService";
// import * as faceEmbeddingsQueries from "../../../database/queries/faceEmbeddingsQueries";
// import * as photoQueries from "../../../database/queries/photoQueries";
// import { User } from "../../../database/queries/userQueries";
//
// jest.mock("../../../database/dbClient", () => ({
//   db: {
//     connect: jest.fn(),
//   },
// }));
// jest.mock("../../../database/queries/userQueries");
// jest.mock("../../../database/queries/operatorQueries");
// jest.mock("../../../database/queries/blacklistUsersQueries");
// jest.mock("../../services/embeddingService");
// jest.mock("../../../database/queries/faceEmbeddingsQueries");
// jest.mock("../../../database/queries/photoQueries");
//
// describe("registration", () => {
//   let mockReq: Partial<Request>;
//   let mockRes: Partial<Response>;
//   const imageBuffer = fs.readFileSync("./tests/assets/images.jpg");
//
//   const mockUser: User = {
//     user_id: 1,
//     phone: "1234567890",
//     balance:0,
//     survey_lock_until: null,
//     status: "free",
//     created_at: "2025-01-01T12:00:00Z",
//     last_init: "2025-01-02T12:00:00Z",
//     updated_at: "2025-01-03T12:00:00Z",
//   };
//   beforeEach(() => {
//     mockReq = {
//       body: {
//         userId: "123",
//         userPhone: "1234567890",
//         isSavePhoto: "1",
//       },
//       file: {
//         buffer: imageBuffer,
//         fieldname: "",
//         originalname: "",
//         encoding: "",
//         mimetype: "image/",
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
//     const mockDbConnection = {
//       query: jest.fn(),
//       release: jest.fn(),
//     };
//     (dbClient.db.connect as jest.Mock).mockReturnValue(mockDbConnection);
//     jest.clearAllMocks();
//   });
//
//   it("should return 400 if file is missing", async () => {
//     mockReq.file = undefined;
//
//     await registration(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(400);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "missing_photo",
//     });
//   });
//
//   it("should return 400 if userId is missing", async () => {
//     mockReq.body.userId = undefined;
//
//     await registration(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(400);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "missing_user_id",
//     });
//   });
//
//   it("should return 200 if user already exists by phone", async () => {
//     jest.spyOn(userQueries, "findUserByPhone").mockResolvedValue(mockUser);
//
//     await registration(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 0,
//       text: "user_exist_number",
//     });
//   });
//
//   it("should return 200 if no face is detected", async () => {
//     jest.spyOn(userQueries, "findUserByPhone").mockResolvedValue(undefined);
//     jest.spyOn(embeddingService, "detectFaces").mockResolvedValue([]);
//
//     await registration(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "face_not_found",
//     });
//   });
//
//   it("should return 200 on successful registration", async () => {
//     jest.spyOn(userQueries, "findUserByPhone").mockResolvedValue(undefined);
//
//     jest
//       .spyOn(embeddingService, "detectFaces")
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-expect-error
//       .mockResolvedValue([{ descriptor: [0.1, 0.2, 0.3] }]);
//     jest
//       .spyOn(faceEmbeddingsQueries, "getAllFaceEmbeddings")
//       .mockResolvedValue([]);
//     jest.spyOn(userQueries, "addUser").mockResolvedValue();
//     jest.spyOn(photoQueries, "addPhoto").mockResolvedValue();
//     jest.spyOn(faceEmbeddingsQueries, "addFaceEmbedding").mockResolvedValue();
//
//     await registration(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(200);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 1,
//       text: "success",
//     });
//   });
//
//   it("should handle server error gracefully", async () => {
//     jest.spyOn(userQueries, "findUserByPhone").mockImplementation(() => {
//       throw new Error("Unexpected error");
//     });
//
//     await registration(mockReq as Request, mockRes as Response);
//
//     expect(mockRes.status).toHaveBeenCalledWith(500);
//     expect(mockRes.send).toHaveBeenCalledWith({
//       status: 2,
//       text: "server_error",
//     });
//   });
// });
