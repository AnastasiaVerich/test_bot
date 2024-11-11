import {Bot, InlineKeyboard, Keyboard} from "grammy";


//Store bot screaming status
let screaming = false;

//Create a new bot
const bot = new Bot("7328080458:AAH19PYr9pTIRVF3frIurHNjtn_hF_xnAJ4");


//This function handles the /scream command
bot.command("scream", () => {
    screaming = true;
});

//This function handles /whisper command
bot.command("whisper", () => {
    screaming = false;
});

//Pre-assign menu text
const firstMenu = "<b>Menu 1</b>\n\nA beautiful menu with a shiny inline button.";
const secondMenu = "<b>Menu 2</b>\n\nA better menu with even more shiny inline buttons.";

//Pre-assign button text
const FAQButton = "faq";
const FAQButtonText = "Вопросы/ответы";

const PhotoVideoButton = "photo_video";
const PhotoVideoButtonText = "Фото/видео контроль";

const GeolocationButton = "geolocation";
const GeolocationButtonText = "Геолокация";

const backButton = "Back";
const backButtonText = "Назад";

const tutorialButton = "Tutorial";

//Build keyboards
const mainMenuMarker = new InlineKeyboard()
    .text(PhotoVideoButtonText, PhotoVideoButton)
    .text(GeolocationButtonText, GeolocationButton)
    .text(FAQButtonText, FAQButton);

const FAQMenuMarkup = new InlineKeyboard().text(backButtonText, backButton).text('какой-то вопрос', "https://core.telegram.org/bots/tutorial");


//This handler sends a menu with the inline buttons we pre-assigned above
bot.command("menu", async (ctx) => {
    await ctx.reply(firstMenu, {
        parse_mode: "HTML",
        reply_markup: mainMenuMarker,
    });
});

//This handler processes back button on the menu
bot.callbackQuery(backButton, async (ctx) => {
    //Update message content with corresponding menu section
    await ctx.editMessageText(firstMenu, {
        reply_markup: mainMenuMarker,
        parse_mode: "HTML",
    });
});
//This handler processes next button on the menu
bot.callbackQuery(FAQButton, async (ctx) => {
    //Update message content with corresponding menu section
    await ctx.editMessageText(secondMenu, {
        reply_markup: FAQMenuMarkup,
        parse_mode: "HTML",
    });
});
bot.callbackQuery(GeolocationButton, async (ctx) => {

    await ctx.reply("Пожалуйста, отправьте вашу геопозицию.", {
        reply_markup: {
            keyboard: [
                [{ text: "Отправить геопозицию", request_location: true }],  // Кнопка, которая вызывает галерею
            ],
            one_time_keyboard: true,
            resize_keyboard: true,
        },
    });
});
bot.callbackQuery(PhotoVideoButton, async (ctx) => {
    await ctx.reply("ляля три рубля.", {
        reply_markup: {
            keyboard: [
                [{ text: "Открыть апп", web_app: {url:'https://anastasiaverich.github.io/test_bot/'} }],  // Кнопка, которая вызывает галерею
            ],
            one_time_keyboard: true,
            resize_keyboard: true,
        },
    });
});



//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on("message", async (ctx) => {
    //Print to console
    console.log(ctx);
    console.log(
        `${ctx.from.first_name} wrote ${
            "text" in ctx.message ? ctx.message.text : ""
        }`,
    );

    if (screaming && ctx.message.text) {
        //Scream the message
        await ctx.reply(ctx.message.text.toUpperCase(), {
            entities: ctx.message.entities,
        });
    } else {
        //This is equivalent to forwarding, without the sender's name
        await ctx.copyMessage(ctx.message.chat.id);
    }
});

//Start the Bot
bot.start();
