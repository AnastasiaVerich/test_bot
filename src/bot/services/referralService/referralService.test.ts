import QRCode from "qrcode";
import { ReferralService } from "./referralService"; // Мокируем зависимость QRCode

// Мокаем метод QRCode.toBuffer
jest.mock("qrcode", () => ({
  toBuffer: jest.fn(),
}));

describe("ReferralService", () => {
  const botUsername = "test_bot";
  const referralService = new ReferralService(botUsername);

  describe("generateReferralLink", () => {
    // Проверяем, что метод generateReferralLink правильно формирует ссылку
    it("should generate a valid referral link", () => {
      const userId = "12345";
      const expectedLink = `https://t.me/${botUsername}?start=${userId}`;

      const result = referralService.generateReferralLink(userId);

      expect(result).toBe(expectedLink);
    });
  });

  describe("generateQRCode", () => {
    // Проверяем, что метод generateQRCode правильно формирует QRCode
    it("should generate a QR code", async () => {
      const link = "https://t.me/test_bot?start=12345";
      const buffer = Buffer.from("QR code");

      (QRCode.toBuffer as jest.Mock).mockResolvedValue(buffer);

      const result = await referralService.generateQRCode(link);

      expect(result).toEqual(buffer);
      expect(QRCode.toBuffer).toHaveBeenCalledWith(link);
    });

    //проверяем, что метод выбрасывает ошибку с правильным сообщением
    it("should throw an error if QR code generation fails", async () => {
      const link = "https://t.me/test_bot?start=12345";
      const errorMessage = "Ошибка при генерации QR-кода: Error: Some error";

      // Мокаем ошибку при генерации QR-кода
      (QRCode.toBuffer as jest.Mock).mockRejectedValue(new Error("Some error"));

      await expect(referralService.generateQRCode(link)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
