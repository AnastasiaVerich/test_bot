// import { db } from "../dbClient";
// import {
//   getRecentSurveyTypesForUser,
//   findAvailableSurvey,
//   reserveSurvey,
//   resetReserveSurvey,
//   inProgressSurvey,
// } from "./surveyQueries";
//
// jest.mock("../dbClient");
//
// describe("Survey Queries", () => {
//   describe("getRecentSurveyTypesForUser", () => {
//     // Проверяем успешное получение списка недавних типов опросов для пользователя
//     it("Should return recent survey types for a user", async () => {
//       const mockTypes = [{ survey_type: "animals" }, { survey_type: "city" }];
//       (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockTypes });
//
//       const result = await getRecentSurveyTypesForUser(1, 7);
//       expect(result).toEqual(["animals", "city"]);
//       expect(db.query).toHaveBeenCalledWith(
//         `
//             SELECT DISTINCT s.survey_type
//             FROM survey_completions ust
//             JOIN surveys s ON ust.survey_id = s.survey_id
//             WHERE ust.user_id = $1 AND ust.started_at >= NOW() - $2 * INTERVAL '1 day'
//         `,
//         [1, 7],
//       );
//     });
//
//     // Проверяем обработку ошибки при сбое запроса
//     it("Should throw an error if query fails", async () => {
//       (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
//
//       await expect(getRecentSurveyTypesForUser(1, 7)).rejects.toThrow(
//         "Error getRecentSurveyTypesForUser: DB Error",
//       );
//     });
//   });
//
//   describe("findAvailableSurvey", () => {
//     // Проверяем успешное нахождение доступного опроса
//     it("Should return an available survey", async () => {
//       const mockSurvey = {
//         survey_id: 1,
//         region_id: 2,
//         reserved_by_user_id: null,
//         reserved_by_operator_id: null,
//         survey_type: "animals",
//         topic: "Animal Behavior",
//         status: "available",
//         reserved_until: null,
//         created_at: "2023-01-01T00:00:00Z",
//         updated_at: "2023-01-02T00:00:00Z",
//       };
//       (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSurvey] });
//
//       const result = await findAvailableSurvey(1, 2, ["city"]);
//       expect(result).toEqual(mockSurvey);
//       expect(db.query).toHaveBeenCalledWith(
//         `SELECT s.*
//             FROM surveys s
//             LEFT JOIN survey_completions ust
//                 ON s.survey_id = ust.survey_id
//                 AND ust.user_id = $1
//             WHERE s.region_id = $2
//                 AND s.status = 'available'
//          AND s.survey_type NOT IN ('city') AND ust.survey_id IS NULL`,
//         [1, 2],
//       );
//     });
//
//     // Проверяем, что возвращается null, если доступных опросов нет
//     it("Should return null if no surveys are available", async () => {
//       (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
//
//       const result = await findAvailableSurvey(1, 2, ["city"]);
//       expect(result).toBeNull();
//     });
//
//     // Проверяем обработку ошибки при сбое запроса
//     it("Should throw an error if query fails", async () => {
//       (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
//
//       await expect(findAvailableSurvey(1, 2, ["city"])).rejects.toThrow(
//         "Error findAvailableSurvey: DB Error",
//       );
//     });
//   });
//
//   describe("reserveSurvey", () => {
//     // Проверяем успешное бронирование опроса
//     it("Should successfully reserve a survey", async () => {
//       (db.query as jest.Mock).mockResolvedValueOnce({});
//
//       await reserveSurvey(1, 2, 3, 30);
//
//       expect(db.query).toHaveBeenCalledWith(
//         `
//         UPDATE surveys
//         SET status = 'reserved',
//             reserved_by_user_id = $1,
//             reserved_by_operator_id = $2,
//             reserved_until = NOW() + INTERVAL '30 minutes',
//             updated_at = NOW()
//         WHERE survey_id = $3;
//     `,
//         [2, 3, 1],
//       );
//     });
//
//     // Проверяем обработку ошибки при сбое запроса
//     it("Should throw an error if query fails", async () => {
//       (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
//
//       await expect(reserveSurvey(1, 2, 3, 30)).rejects.toThrow(
//         "Error reserveSurvey: DB Error",
//       );
//     });
//   });
//
//   describe("resetReserveSurvey", () => {
//     // Проверяем успешное освобождение опроса
//     it("Should successfully reset reserve a survey", async () => {
//       (db.query as jest.Mock).mockResolvedValueOnce({});
//
//       await resetReserveSurvey(1);
//
//       expect(db.query).toHaveBeenCalledWith(
//         `
//         UPDATE surveys
//         SET status = 'available',
//             reserved_by_user_id = NULL,
//             reserved_by_operator_id = NULL,
//             reserved_until = NULL,
//             updated_at = NOW()
//         WHERE survey_id = $1;
//     `,
//         [1],
//       );
//     });
//
//     // Проверяем обработку ошибки при сбое запроса
//     it("Should throw an error if query fails", async () => {
//       (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
//
//       await expect(resetReserveSurvey(1)).rejects.toThrow(
//         "Error resetReserveSurvey: DB Error",
//       );
//     });
//   });
//
//   describe("inProgressSurvey", () => {
//     // Проверяем успешное освобождение опроса
//     it("Should successfully change status for survey", async () => {
//       (db.query as jest.Mock).mockResolvedValueOnce({});
//
//       await inProgressSurvey(1);
//
//       expect(db.query).toHaveBeenCalledWith(
//         `
//         UPDATE surveys
//         SET status = 'in_progress',
//             reserved_until = NULL,
//             updated_at = NOW()
//         WHERE survey_id = $1;
//     `,
//         [1],
//       );
//     });
//
//     // Проверяем обработку ошибки при сбое запроса
//     it("Should throw an error if query fails", async () => {
//       (db.query as jest.Mock).mockRejectedValueOnce(new Error("DB Error"));
//
//       await expect(inProgressSurvey(1)).rejects.toThrow(
//         "Error inProgressSurvey: DB Error",
//       );
//     });
//   });
// });
