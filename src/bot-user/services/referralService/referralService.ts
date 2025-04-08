import QRCode from "qrcode";

export class ReferralService {
  private botUsername: string;

  constructor(botUsername: string) {
    this.botUsername = botUsername;
  }
  // Генерация реферальной ссылки
  generateReferralLink(userId: string): string {
    return `https://t.me/${this.botUsername}?start=${userId}`;
  }

  // Генерация QR-кода
  async generateQRCode(link: string): Promise<Buffer> {
    try {
      return await QRCode.toBuffer(link);
    } catch (error) {
      let shortError = "";
      if (error instanceof Error) {
        shortError = error.message.substring(0, 50);
      } else {
        shortError = String(error).substring(0, 50);
      }
      throw new Error("Ошибка при генерации QR-кода: " + shortError);
    }
  }
}
