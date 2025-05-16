import QRCode from "qrcode";

export class ReferralService {
    private botUsername: string;

    constructor(botUsername: string) {
        this.botUsername = botUsername;
    }
    // Генерация реферальной ссылки
    generateReferralLink(start_string: string): string {
        return `https://t.me/${this.botUsername}?start=${start_string}`;
    }

    // Генерация QR-кода
    async generateQRCode(link: string): Promise<Buffer> {
        try {
            return await QRCode.toBuffer(link);
        } catch (error) {

            throw new Error("Ошибка при генерации QR-кода: " + error);
        }
    }
}
