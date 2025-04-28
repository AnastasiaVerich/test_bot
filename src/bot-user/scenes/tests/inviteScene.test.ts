// import { invite } from "./invite";
// import { ReferralService } from "../../services/referralService/referralService";
// import { INVITE_SCENE } from "../../constants/scenes";
// import { MESSAGES } from "../../constants/messages";
// import logger from "../../../lib/logger";
// import { getUserId } from "../../utils/getUserId";
//
// jest.mock("../../services/referralService/referralService");
// jest.mock("../../utils/getUserId");
// jest.mock("../../../lib/logger");
//
// const mockCtx = {
//   me: { username: "mock_bot" },
//   replyWithPhoto: jest.fn(),
//   reply: jest.fn(),
// } as any;
//
// describe("invite", () => {
//   let mockConversation: any;
//
//   beforeEach(() => {
//     mockConversation = {}; // Мокаем пустой объект для conversation
//     jest.clearAllMocks();
//   });
//
//   // Должен корректно отправить сообщение с QR-кодом и реферальной ссылкой
//   it("should send a message with QR code and referral link", async () => {
//     const mockUserId = 123;
//     const mockReferralLink = "https://t.me/mock_bot?start=123";
//     const mockQRCode = Buffer.from("mock_qr_code");
//
//     // Мокаем `getUserId` для возврата ID пользователя
//     (getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
//
//     // Мокаем методы ReferralService
//     const mockGenerateReferralLink = jest
//       .fn()
//       .mockReturnValue(mockReferralLink);
//     const mockGenerateQRCode = jest.fn().mockResolvedValue(mockQRCode);
//     (ReferralService as jest.Mock).mockImplementation(() => ({
//       generateReferralLink: mockGenerateReferralLink,
//       generateQRCode: mockGenerateQRCode,
//     }));
//
//     await invite(mockConversation, mockCtx);
//
//     expect(mockGenerateReferralLink).toHaveBeenCalledWith(
//       mockUserId.toString(),
//     );
//     expect(mockGenerateQRCode).toHaveBeenCalledWith(mockReferralLink);
//     expect(mockCtx.replyWithPhoto).toHaveBeenCalledWith(
//       expect.objectContaining({ fileData: expect.any(Buffer) }),
//       expect.objectContaining({
//         caption: `${INVITE_SCENE.INVITE_FRIENDS}${mockReferralLink}`,
//         reply_markup: expect.any(Object),
//       }),
//     );
//   });
//
//   // Должен вернуть void, если userId не определен
//   it("should return void if userId is undefined", async () => {
//     (getUserId as jest.Mock).mockResolvedValueOnce(null);
//
//     const result = await invite(mockConversation, mockCtx);
//
//     expect(result).toBeUndefined();
//     expect(mockCtx.replyWithPhoto).not.toHaveBeenCalled();
//   });
//
//   // Должен отправить сообщение об ошибке при исключении
//   it("should send error message when an exception occurs", async () => {
//     const error_text = "Test error";
//     const error = new Error(error_text);
//     (getUserId as jest.Mock).mockRejectedValueOnce(error);
//
//     await invite(mockConversation, mockCtx);
//
//     expect(logger.error).toHaveBeenCalledWith(
//       "Error in invite: " + error_text,
//     );
//     expect(mockCtx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR);
//   });
// });
