import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../../index";
import {SCENES_REGISTRATION} from "../../config/constants";
import {SendContactKeyboard} from "../../keyboards/reply/sendContact";
import {OpenWebAppKeyboard} from "../../keyboards/reply/openWebApp";


export async function registrationScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    // Шаг 1: Ожидаем номер телефона
    await ctx.reply(SCENES_REGISTRATION.InterNumber, {
        reply_markup: SendContactKeyboard,
    });
    const { message: contactMessage } = await conversation.waitFor("message:contact");
    const userPhone = contactMessage.contact?.phone_number;

    // Шаг 2: Ожидаем фото
    await ctx.reply(SCENES_REGISTRATION.InterPhoto, {
        reply_markup: OpenWebAppKeyboard,
    });
    const message = await conversation.waitFor("message:web_app_data");
    if (message.message?.web_app_data) {

        const data = JSON.parse(message.message.web_app_data.data);
        //await ctx.reply(`Получены данные: ${JSON.stringify(data)}`);

        if (data.result === "new_face") {
            await ctx.reply("Фото принято!");
            // Переход к следующему шагу
        } else if(data.result === "user_exist") {
            await ctx.reply("Пользователь существует.");
            return
        }
    } else {
        await ctx.reply("Ожидались данные из Web App, но пришло что-то другое.");
    }

    // Шаг 3: Ожидаем имя
    await ctx.reply("Введите ваше имя:");
    const { message: nameMessage } = await conversation.waitFor("message:text");
    const userName = nameMessage.text;
    // Завершаем сцену
    await ctx.reply(`Спасибо! Ваше имя: ${userName}, телефон: ${userPhone}.`);
}
