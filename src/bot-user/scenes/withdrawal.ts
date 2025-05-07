import {Message} from "grammy/types";
import {addPendingPayment, findPendingPaymentByUserId,} from "../../database/queries/pendingPaymentsQueries";
import logger from "../../lib/logger";
import {getUserId} from "../../bot-common/utils/getUserId";
import {checkBalance, updateMinusUserBalance} from "../../database/queries/userQueries";

import {Conversation} from "@grammyjs/conversations";
import {BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {AuthUserKeyboard, ConfirmCancelButtons, EmptyKeyboard} from "../../bot-common/keyboards/keyboard";
import {BalanceMenu} from "../../bot-common/keyboards/inlineKeyboard";
import {WITHDRAWAL_USER_SCENE} from "../../bot-common/constants/scenes";
import {MyContext, MyConversation, MyConversationContext} from "../../bot-common/types/type";
import {getCommonVariableByLabel} from "../../database/queries/commonVariablesQueries";

export async function withdrawalScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
): Promise<Message.TextMessage | void> {
    try {
        let curseInfo = await getCommonVariableByLabel('ton_rub_price')
        if(!curseInfo){
            return
        }
        const curseTon = Number(curseInfo.value)
        const userId = await conversation.external(() => getUserId(ctx));
        if (!userId) return

        // Проверка на наличие ожидающего платежа
        const pendingPayment = await conversation.external(() => findPendingPaymentByUserId(userId));
        if (pendingPayment.length > 0) {
            return ctx.reply(WITHDRAWAL_USER_SCENE.HAS_PENDING_PAYMENT);
        }

        // Проверка баланса пользователя
        const balance = await conversation.external(() => checkBalance(userId));

        if (!balance) {
            await ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
                reply_markup: BalanceMenu(),
            });
            return
        }


        const userTonBalance = Number((balance / curseTon).toFixed(2))
        if (Number(userTonBalance) === 0) {
            await ctx.reply(WITHDRAWAL_USER_SCENE.INVALID_BALANCE);
            return
        }

        // Шаг 1: Ожидаем ввода суммы для вывода
        const amountTON = await stepAmount(conversation, ctx, userTonBalance);
        if (!amountTON) {
            await ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
                reply_markup: BalanceMenu(),
            });
            return
        }

        // Шаг 2: Ожидаем ввода адреса для перевода
        const recipientAddress = await stepWallet(conversation, ctx);
        if (!recipientAddress) {
            await ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
                reply_markup: BalanceMenu(),
            });
            return
        }

        // Шаг 3: Подтверждение вывода средств
        const resultConfirm = await stepConfirm(conversation, ctx, recipientAddress, amountTON)
        if (!resultConfirm) {
            await ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
                reply_markup: BalanceMenu(),
            });
            return
        }

        if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
            // Добавляем платеж в список ожидающих
            await addPendingPayment(userId, amountTON, recipientAddress);
            await updateMinusUserBalance(userId, amountTON * curseTon);

            logger.info(
                `Пользователь ${userId} инициировал вывод ${amountTON} TON на адрес ${recipientAddress}`,
            );
            return ctx.reply(WITHDRAWAL_USER_SCENE.SUCCESS, {
                reply_markup: AuthUserKeyboard(),
            });
        } else {
            logger.info(`Пользователь ${userId} отменил снятие средств.`);
            return ctx.reply(WITHDRAWAL_USER_SCENE.CANCELLED, {
                reply_markup: AuthUserKeyboard(),
            });
        }
    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        logger.error("Error in withdrawal: " + shortError);
        await ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
            reply_markup: BalanceMenu(),
        });
        await conversation.external((ctx) => {
            delete ctx.session.withdrawal.amountTON;
            delete ctx.session.withdrawal.amountTonWallet;
        });
        return
    }
}

async function stepAmount(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
    userTonBalance: number
) {

    try {
        await ctx.reply(WITHDRAWAL_USER_SCENE.ENTER_AMOUNT, {
            parse_mode: "HTML",
            reply_markup: {remove_keyboard: true},
        });

        let result: number | null = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:text", {
                otherwise: (ctx) => ctx.reply(WITHDRAWAL_USER_SCENE.ENTERED_AMOUNT_OTHERWISE, {
                    parse_mode: "HTML",
                    reply_markup: {remove_keyboard: true},
                }),
            });

            if (!response.message?.text) break

            const amountText = response.message?.text;
            const amountTON = parseFloat(amountText ?? "0");

            if (isNaN(amountTON) || amountTON < 0.05 || amountTON > userTonBalance) {
                await ctx.reply(WITHDRAWAL_USER_SCENE.INVALID_AMOUNT.replace(
                    "{balance}",
                    userTonBalance.toString(),
                ), {
                    parse_mode: "HTML",
                    reply_markup: {remove_keyboard: true},
                });
                continue
            }
            result = amountTON;
            break
        }

        if (!result) return null

        await ctx.reply(`${WITHDRAWAL_USER_SCENE.ENTERED_AMOUNT} ${result} TON`, {
            reply_markup: {remove_keyboard: true},
        });

        await conversation.external((ctx) => {
            ctx.session.withdrawal.amountTON = result;
        });

        return result;
    } catch (error) {
        return null;
    }
}

async function stepWallet(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext
) {

    try {
        await ctx.reply(WITHDRAWAL_USER_SCENE.ENTER_WALLET, {
            parse_mode: "HTML",
            reply_markup: EmptyKeyboard(),
        });

        let result: string | null = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:text", {
                otherwise: (ctx) => ctx.reply(WITHDRAWAL_USER_SCENE.ENTER_WALLET_OTHERWISE, {
                    parse_mode: "HTML",
                    reply_markup: EmptyKeyboard(),
                }),
            });

            if (!response.message?.text) break

            const wallet = response.message?.text.trim();

            if (wallet?.length === 0) {
                await ctx.reply(WITHDRAWAL_USER_SCENE.ENTERED_INVALID_WALLET, {
                    parse_mode: "HTML",
                    reply_markup: EmptyKeyboard(),
                });
                continue
            }
            result = wallet;
            break
        }

        if (!result) return null


        await conversation.external((ctx) => {
            ctx.session.withdrawal.amountTonWallet = result;
        });

        return result;
    } catch (error) {
        return null;
    }
}

async function stepConfirm(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
    recipientAddress: string,
    amountTON: number,
) {

    try {
        await ctx.reply(
            WITHDRAWAL_USER_SCENE.CONFIRMATION.replace(
                "{amount}",
                amountTON.toString(),
            ).replace("{address}", recipientAddress),
            {
                parse_mode: "HTML",
                reply_markup: ConfirmCancelButtons(),
            },
        );

        let result: string | null = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitForHears(
                [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
                {
                    otherwise: (ctx) => ctx.reply(WITHDRAWAL_USER_SCENE.CONFIRMATION_OTHERWISE, {
                        parse_mode: "HTML",
                        reply_markup: ConfirmCancelButtons(),
                    }),
                });

            if (!response.message?.text) break

            result = response.message?.text;
            break
        }

        if (!result) return null
        return result;
    } catch (error) {
        return null;
    }
}
