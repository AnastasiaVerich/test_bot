import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../types/type";
import {InlineKeyboard, InputFile} from "grammy";
import {ReferralService} from "../services/referralService/referralService";
import {INVITE_SCENE} from "../constants/scenes";
import {BUTTONS_KEYBOARD} from "../constants/button";


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
            caption: `${INVITE_SCENE.INVITE_FRIENDS}${referralLink}`,
            parse_mode: "HTML", // Указываем, что текст содержит HTML
            reply_markup: new InlineKeyboard()
                .url(BUTTONS_KEYBOARD.ShareButton,  `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
                    INVITE_SCENE.INVITE_MESSAGE
                )}`),
        }
    );
}
