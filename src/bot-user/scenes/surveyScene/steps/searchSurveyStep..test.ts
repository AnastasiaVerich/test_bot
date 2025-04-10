// import { MyContext } from "../../../types/type";
//
// import {
//   findAvailableSurvey,
//   getRecentSurveyTypesForUser,
//   Survey,
// } from "../../../../database/queries/surveyQueries";
// import { searchSurveyStep } from "./searchSurveyStep";
// import { RegionSettings } from "../../../../database/queries/regionQueries";
// import { SURVEY_SCENE } from "../../../constants/scenes";
//
// // Мокаем зависимости
// jest.mock("../../../../database/queries/surveyQueries");
// jest.mock("../../../../database/queries/regionQueries");
//
// describe("Test regionState", () => {
//   let ctx: Partial<MyContext>;
//   const survey: Partial<Survey> = { survey_id: 123 };
//
//   beforeEach(() => {
//     ctx = {
//       from: {
//         id: 12345,
//         is_bot: false,
//         first_name: "User_test",
//       },
//       reply: jest.fn(),
//       conversation: {
//         enter: jest.fn(),
//       } as unknown as MyContext["conversation"],
//     };
//   });
//
//   // Должна вернуть опрос и не вызвать reply, если опрос найден
//   it("Should return survey and no coll reply", async () => {
//     (getRecentSurveyTypesForUser as jest.Mock).mockResolvedValue([]);
//     (findAvailableSurvey as jest.Mock).mockResolvedValue(survey);
//
//     const result = await searchSurveyStep(
//       ctx as MyContext,
//       123,
//       {} as RegionSettings,
//     );
//
//     expect(ctx.reply).not.toHaveBeenCalled();
//     expect(result).toStrictEqual(survey);
//   });
//
//   // Должна вернуть null и  вызвать reply, если опрос не найден
//   it("Should return null and  reply message", async () => {
//     (getRecentSurveyTypesForUser as jest.Mock).mockResolvedValue([]);
//     (findAvailableSurvey as jest.Mock).mockResolvedValue(null);
//
//     const result = await searchSurveyStep(
//       ctx as MyContext,
//       123,
//       {} as RegionSettings,
//     );
//
//     expect(ctx.reply).toHaveBeenCalledWith(SURVEY_SCENE.SURVEY_NOT_FOUND, {
//       reply_markup: expect.any(Object),
//     });
//     expect(result).toBeNull();
//   });
// });
