// import { MyContext } from "../../../types/type";
//
// import { RegionSettings } from "../../../../database/queries/regionQueries";
// import { SURVEY_SCENE } from "../../../constants/scenes";
// import {
//   getOperatorsByRegionAndStatus,
//   Operator,
// } from "../../../../database/queries/operatorQueries";
// import { searchOperatorStep } from "./searchOperatorStep";
//
// // Мокаем зависимости
// jest.mock("../../../../database/queries/operatorQueries");
//
// describe("Test searchOperatorStep", () => {
//   let ctx: Partial<MyContext>;
//   const freeOperator: Partial<Operator> = { operator_id: 123 };
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
//   // Должна вернуть оператора и не вызвать reply, если оператор свободный найден
//   it("Should return survey and no coll reply", async () => {
//     (getOperatorsByRegionAndStatus as jest.Mock).mockResolvedValue([
//       freeOperator,
//     ]);
//
//     const result = await searchOperatorStep(
//       ctx as MyContext,
//       {} as RegionSettings,
//     );
//
//     expect(ctx.reply).not.toHaveBeenCalled();
//     expect(result).toStrictEqual(freeOperator);
//   });
//
//   // Должна вернуть null и  вызвать reply, если свободный оператор не найден
//   it("Should return null and  reply message", async () => {
//     (getOperatorsByRegionAndStatus as jest.Mock).mockResolvedValue([]);
//
//     const result = await searchOperatorStep(
//       ctx as MyContext,
//       {} as RegionSettings,
//     );
//
//     expect(ctx.reply).toHaveBeenCalledWith(SURVEY_SCENE.OPERATOR_NOT_FOUND, {
//       reply_markup: expect.any(Object),
//     });
//     expect(result).toBeNull();
//   });
// });
