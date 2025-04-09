import { Cell, internal, TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import {
  deletePendingPayment,
  getAllPendingPayment,
  updateAttemptPendingPayment,
} from "../database/queries/pendingPaymentsQueries";
import { seed_phrase } from "../config/env";
import logger from "../lib/logger";
import {addWithdrawalLog} from "../database/queries/withdrawalLogsQueries";

export async function executePendingPayments(): Promise<void> {
  logger.info("Запуск задачи проверки ожидающих платежей");
  let pass = false;
  try {
    const pendingPayments = await getAllPendingPayment();

    for (const payment of pendingPayments) {
      if (payment.attempts >= 1) {
        //0 1 2 3
        logger.info(
          `Оператору: Все попытки отправки платежа для пользователя ${payment.user_id} исчерпаны.`,
        );
        continue;
      }
      if (!pass) {

        await updateAttemptPendingPayment(payment.user_id, payment.attempts + 1);

        const result = await make_payment(payment.amount, payment.address);
        logger.info(result)
        if (result.isSuccess) {
          await deletePendingPayment(payment.user_id);
          await addWithdrawalLog(payment.user_id,payment.amount,payment.address);

        } else {
          switch (result.reason) {
            case "big gas":
              {
                pass = true;
              }
              break;
            case "little balance":
              {
                pass = true;
              }
              break;
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    logger.error(error);
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Ошибка при выполнении обработки платежей", shortError);

  }
}

type ResponseType = {
  isSuccess: boolean;
  reason?: "big gas" | "little balance" | "some error";
};

export async function make_payment(
  amountTON: number,
  recipientAddress: string,
): Promise<ResponseType> {
  const seedPhraseArr = seed_phrase.split(" ");
  const maxGas = 0.01; // Примерная комиссия за транзакцию

  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey:
      "57f8d70c69075c12c5cb3699ea0c82168028f50609b485ae84c41b59884e97cf" /*Из тг бота @tonapibot*/,
  });

  let keyPair = await mnemonicToPrivateKey(seedPhraseArr);
  let wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  let contract = client.open(wallet);
  let seqno: number = await contract.getSeqno();

  const estimateSumGas = await estimateFee(client, recipientAddress, amountTON);

  logger.info(estimateSumGas)
  if (true/*estimateSumGas <= maxGas*/) {
    const balanceNano = await client.getBalance(wallet.address);
    const balanceTON = Number(balanceNano) / 1e9; // Преобразуем в number и делим

    if (balanceTON < amountTON + estimateSumGas) {
      return { isSuccess: false, reason: "little balance" };
    }
    try {
      await contract.sendTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            to: recipientAddress,
            value: BigInt(amountTON * 1e9), // Сумма перевода в нанотонах
            bounce: false,
          }),
        ],
      });
      return { isSuccess: true };
    } catch (error) {
      logger.info(error);
      return { isSuccess: false, reason: "some error" };
    }
  } else {
    return { isSuccess: false, reason: "big gas" };
  }
}

async function estimateFee(
  client: TonClient,
  recipientAddress: string,
  amountTON: number,
): Promise<number> {
  const seedPhrase = "your mnemonic seed phrase here";
  const seedPhraseArr = seedPhrase.split(" ");
  const keyPair = await mnemonicToPrivateKey(seedPhraseArr);

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });
  const contract = client.open(wallet);

  const seqno: number = await contract.getSeqno();

  // Создаем сообщение для перевода
  const transfer = contract.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to: recipientAddress,
        value: BigInt(amountTON * 1e9), // Сумма перевода в нанотонах
        bounce: false,
      }),
    ],
  });

  // Создаем Cell для сообщения
  const boc = transfer.toBoc();
  const bodyCell = Cell.fromBoc(boc)[0]; // Извлекаем основной Cell

  // Оцениваем комиссию
  const fee = await client.estimateExternalMessageFee(wallet.address, {
    body: bodyCell,
    ignoreSignature: true, // Игнорируем подпись, так как мы только оцениваем
    initCode: null,
    initData: null,
  });

  return (
    fee.source_fees.in_fwd_fee +
    fee.source_fees.storage_fee +
    fee.source_fees.gas_fee +
    fee.source_fees.fwd_fee
  );
}
