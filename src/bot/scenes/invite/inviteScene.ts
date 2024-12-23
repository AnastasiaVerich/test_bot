import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../../../types/type";
import {InlineKeyboard, InputFile} from "grammy";
import {ReferralService} from "../../../services/referralService/referralService";
import {INVITE_FRIENDS, INVITE_MESSAGE, SHARE_BUTTON_TEXT} from "./constants";


export async function inviteScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id ?? ''

    // Получаем имя бота, в формате строки.
    const botName = ctx?.me?.username.toString() ?? '';

    // Создаем экземпляр сервиса реферальных ссылок, передавая в него имя бота.
    const referralService = new ReferralService(botName);

    // Генерируем уникальную реферальную ссылку для текущего пользователя.
    const referralLink = referralService.generateReferralLink(userId.toString());

    // Генерируем QR-код для реферальной ссылки.
    const qrCode = await referralService.generateQRCode(referralLink);

    // Отправляем пользователю сообщение с фото (QR-код), текстом и inline-клавиатурой.
    await ctx.replyWithPhoto(
        new InputFile(qrCode),
        {
            caption: `${INVITE_FRIENDS}${referralLink}`,
            reply_markup: new InlineKeyboard()
                .url(SHARE_BUTTON_TEXT,  `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
                    INVITE_MESSAGE
                )}`),
        }
    );
}
