// import { MESSAGES } from "../constants/messages";
// import { MyContext } from "../types/type";
// import { findUser } from "./findUser";
// import { findUserByTelegramId, User } from "../../database/queries/userQueries";
//
// jest.mock("../../database/queries/userQueries");
//
// describe("Test findUser", () => {
//   let ctx: Partial<MyContext>;
//   let user: Partial<User>;
//
//   beforeEach(() => {
//     ctx = {
//       from: {
//         id: 12345,
//         is_bot: false,
//         first_name: "User_test",
//       },
//       reply: jest.fn(),
//     };
//     user = {
//       user_id: 1234,
//     };
//   });
//
//   // Проверить корректное возрващение id
//   it("Should return user if it exists.", async () => {
//     (findUserByTelegramId as jest.Mock).mockResolvedValueOnce(user);
//
//     const userResp = await findUser(user.user_id!, ctx as MyContext);
//     expect(userResp).toBe(user);
//   });
//
//   // Должно возвращать ошибку, если id не найден
//   it("Should return undefined if it not exists", async () => {
//     (findUserByTelegramId as jest.Mock).mockResolvedValueOnce(undefined);
//
//     const userResp = await findUser(123, ctx as MyContext);
//
//     expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.YOU_NOT_AUTH, {
//       reply_markup: { remove_keyboard: true },
//     });
//     expect(userResp).toBeUndefined();
//   });
// });
