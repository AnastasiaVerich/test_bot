import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../types/type";
import {seed_phrase} from "../../config/env";
import {TonClient, WalletContractV4} from "@ton/ton";
import {mnemonicToPrivateKey} from "@ton/crypto";
import {MESSAGES} from "../constants/messages";

const seedPhraseArr =  seed_phrase.split(' ')

export async function withdrawalScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id;

    if (!userId) {
        return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }

    const recipientAddress = 'UQClrpElCar-II5uBTIWjY5dBjYcbenGc3DhKDKjr4p-Skhm'; // Адрес получателя( Я я кошелек)
    const amountTON = 0.05; // Количество TON для отправки






    // Create Client
    const client = new TonClient({
        endpoint: 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: "57f8d70c69075c12c5cb3699ea0c82168028f50609b485ae84c41b59884e97cf",
    });

    let keyPair = await mnemonicToPrivateKey(seedPhraseArr);


    // Create wallet contract
    let workchain = 0; // Usually you need a workchain 0
    let wallet = WalletContractV4.create({ workchain:workchain, publicKey: keyPair.publicKey });
    const friendlyAddress = wallet.address.toString({ testOnly: false,  bounceable: false    });
    console.log("Friendly Address (UQ):", friendlyAddress);
    console.log("Friendly Address (UQ):", wallet.address.toString());

    let contract = client.open(wallet);

    const balanceNano = await client.getBalance(wallet.address);
    const balanceTON = Number(balanceNano) / 1e9; // Преобразуем в number и делим
    console.log("Баланс в TON:", balanceTON);
    const estimatedFeeTON = 0.01; // Примерная комиссия за транзакцию
    if (balanceTON < amountTON + estimatedFeeTON) {
        await ctx.reply("Недостаточно средств для перевода и оплаты комиссии.");
        return;
    }

    let seqno: number = await contract.getSeqno();
    console.log("Current seqno:", seqno);
    // try {
    //     await contract.sendTransfer({
    //         seqno,
    //         secretKey: keyPair.secretKey,
    //         keyboard_messages: [
    //             internal({
    //                 to: recipientAddress,
    //                 value: BigInt(amountTON * 1e9), // Сумма перевода в нанотонах
    //                 bounce: false,
    //             }),
    //         ],
    //     });
    //
    //     console.log(`Транзакция на ${amountTON} TON успешно отправлена.`);
    //     await ctx.reply(`Транзакция на ${amountTON} TON успешно отправлена.`);
    // } catch (error) {
    //
    //     console.error("Общая ошибка:", error);
    //
    //     await ctx.reply("Ошибка при отправке транзакции. Попробуйте позже.");
    // }

    await ctx.reply(MESSAGES.none);
}
