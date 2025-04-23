// import { faceCheckStep } from "./steps/faceCheckStep";
// import { identificationScene } from "./identificationScene";
// import { IDENTIFICATION_SCENE } from "../../constants/scenes";
// import { AuthUserKeyboard } from "../../../bot-user/keyboards/AuthUserKeyboard";
// import { MESSAGES } from "../../constants/messages";
//
// jest.mock("./steps/faceCheckStep");
// jest.mock("../../../bot-user/keyboards/AuthUserKeyboard");
// jest.mock("../../../lib/logger");
//
// const mockCtx = {
//   reply: jest.fn(),
// } as any;
//
// describe("Test identificationScene", () => {
//   let mockConversation: any;
//
//   beforeEach(() => {
//     mockConversation = {}; // Для упрощения мокаем пустой объект
//     jest.clearAllMocks();
//   });
//
//   // Должен отправлять определенное сообщение, если text равен 'user_is_block'
//   it("Should reply with .USER_IN_BLOCK if text is 'user_is_block'", async () => {
//     (faceCheckStep as jest.Mock).mockResolvedValueOnce("user_is_block");
//
//     await identificationScene(mockConversation, mockCtx);
//
//     expect(mockCtx.reply).toHaveBeenCalledWith(
//       IDENTIFICATION_SCENE.USER_IN_BLOCK,
//     );
//   });
//
//   // Тест: должен отправлять определенное сообщение, если text равен 'similarity_not_confirmed'
//   it("Should reply with .NOT_SIMILAR if text is 'similarity_not_confirmed'", async () => {
//     (faceCheckStep as jest.Mock).mockResolvedValueOnce(
//       "similarity_not_confirmed",
//     );
//
//     await identificationScene(mockConversation, mockCtx);
//
//     expect(mockCtx.reply).toHaveBeenCalledWith(
//       IDENTIFICATION_SCENE.NOT_SIMILAR,
//     );
//   });
//
//   // Тест: должен отправлять SUCCESS и показать AuthUserKeyboard, если text равен 'success'
//   it("should reply with .SUCCESS and show AuthUserKeyboard if text is 'success'", async () => {
//     (faceCheckStep as jest.Mock).mockResolvedValueOnce("success");
//     (AuthUserKeyboard as jest.Mock).mockReturnValueOnce({
//       keyboard: "mock_keyboard",
//     });
//
//     await identificationScene(mockConversation, mockCtx);
//
//     expect(mockCtx.reply).toHaveBeenCalledWith(IDENTIFICATION_SCENE.SUCCESS, {
//       reply_markup: { keyboard: "mock_keyboard" },
//     });
//   });
//
//   // Тест: должен отправлять FAILED для любого другого текста
//   it("Should reply with .FAILED for any other text", async () => {
//     (faceCheckStep as jest.Mock).mockResolvedValueOnce("unknown_text");
//
//     await identificationScene(mockConversation, mockCtx);
//
//     expect(mockCtx.reply).toHaveBeenCalledWith(IDENTIFICATION_SCENE.FAILED);
//   });
//
//   // Тест: должен отправить .SOME_ERROR
//   it("should reply with .SOME_ERROR and log error on exception", async () => {
//     const error = new Error("Test error");
//     (faceCheckStep as jest.Mock).mockRejectedValueOnce(error);
//
//     await identificationScene(mockConversation, mockCtx);
//
//     expect(mockCtx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR);
//   });
// });
