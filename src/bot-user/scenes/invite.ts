import {InlineKeyboard, InputFile} from "grammy";
import {Message} from "grammy/types";
import logger from "../../lib/logger";
import {getUserId} from "../../bot-common/utils/getUserId";
import {BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {RESPONSES} from "../../bot-common/constants/responses";
import {INVITE_USER_SCENE} from "../../bot-common/constants/scenes";
import QRCode from "qrcode";
import {MyConversation, MyConversationContext} from "../../bot-common/types/type";

export async function inviteScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
): Promise<Message.PhotoMessage | Message.TextMessage | void> {
    try {
        const userId = await conversation.external(() => getUserId(ctx));
        if (!userId) return

        // Получаем имя бота, в формате строки.
        const botName = ctx?.me?.username.toString() ?? "";

        // Создаем экземпляр сервиса реферальных ссылок, передавая в него имя бота.
        const referralService = new ReferralService(botName);

        // Генерируем уникальную реферальную ссылку для текущего пользователя.
        const referralLink = referralService.generateReferralLink(
            userId.toString(),
        );

        // Генерируем QR-код для реферальной ссылки.
        const qrCode = await referralService.generateQRCode(referralLink);

        // Отправляем пользователю сообщение с фото (QR-код), текстом и inline-клавиатурой.
        return ctx.replyWithPhoto(new InputFile(qrCode), {
            caption: `${INVITE_USER_SCENE.INVITE_FRIENDS}${referralLink}`,
            parse_mode: "HTML", // Указываем, что текст содержит HTML
            reply_markup: new InlineKeyboard().url(
                BUTTONS_KEYBOARD.ShareButton,
                `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
                    INVITE_USER_SCENE.INVITE_MESSAGE,
                )}`,
            ),
        });
    } catch (error) {

        logger.error("Error in invite: " + error);
        await ctx.reply(RESPONSES.SOME_ERROR);
        return;
    }
}

class ReferralService {
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

            throw new Error("Ошибка при генерации QR-кода: " + error);
        }
    }
}
