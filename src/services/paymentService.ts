import { Cell, internal, TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

import { seed_phrase } from "../config/env";
import logger from "../lib/logger";
import {
  getAllPendingPayment,
  updateAttemptPendingPayment,
} from "../database/queries_kysely/pending_payments";
import {
  getCommonVariableByLabel,
  upsertCommonVariable,
} from "../database/queries_kysely/common_variables";
import { paymentIsCompleted } from "../database/services/paymentService";

export async function executePendingPayments(): Promise<void> {
  let pass = false;
  try {
    const autoPayInfo = await getCommonVariableByLabel("auto_payments_enabled");
    if (!autoPayInfo) {
      return;
    }
    if (autoPayInfo.value === "ON") {
      const pendingPayments = await getAllPendingPayment();

      for (const payment of pendingPayments) {
        if (payment.attempts >= 3) {
          //0 1 2 3
          if (payment.user_id) {
            logger.info(
              `Оператору: Все попытки отправки платежа для пользователя ${payment.user_id} исчерпаны.`,
            );
          } else if (payment.operator_id) {
            logger.info(
              `Оператору: Все попытки отправки платежа для оператора ${payment.operator_id} исчерпаны.`,
            );
          } else if (payment.auditor_id) {
            logger.info(
              `Оператору: Все попытки отправки платежа для оператора ${payment.auditor_id} исчерпаны.`,
            );
          }

          continue;
        }
        if (!pass) {
          if (payment.user_id) {
            await updateAttemptPendingPayment({
              userId: payment.user_id,
              attempts: payment.attempts + 1,
            });
          } else if (payment.operator_id) {
            await updateAttemptPendingPayment({
              operatorId: payment.operator_id,
              attempts: payment.attempts + 1,
            });
          } else if (payment.auditor_id) {
            await updateAttemptPendingPayment({
              auditor_id: payment.auditor_id,
              attempts: payment.attempts + 1,
            });
          }

          const result = await make_payment(payment.amount, payment.wallet);
          if (result.isSuccess) {
            const res = await paymentIsCompleted(payment);
            if (!res) {
              await upsertCommonVariable("auto_payments_enabled", "OFF");

              if (payment.user_id) {
                throw new Error(
                  `Payment ${payment.user_id} is completed, but not delete from db`,
                );
              } else {
                throw new Error(
                  `Payment ${payment.operator_id} is completed, but not delete from db`,
                );
              }
            }
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
              case "not confirmed": {
                pass = true;
                await upsertCommonVariable("auto_payments_enabled", "OFF");

                if (payment.user_id) {
                  throw new Error(
                    `Payment ${payment.user_id} is NOT completed, need check`,
                  );
                } else {
                  throw new Error(
                    `Payment ${payment.operator_id} is NOT completed, need check`,
                  );
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    logger.error("Ошибка при выполнении обработки платежей", error);
  }
}

type ResponseType = {
  isSuccess: boolean;
  reason?: "big gas" | "little balance" | "not confirmed" | "some error";
};

export async function make_payment(
  amountTON: number,
  recipientWallet: string,
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

  const estimateSumGas = await estimateFee(client, recipientWallet, amountTON);

  let conditions = true;
  if (conditions /*estimateSumGas <= maxGas*/) {
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
            to: recipientWallet,
            value: BigInt(amountTON * 1e9), // Сумма перевода в нанотонах
            bounce: false,
          }),
        ],
      });
      logger.info(
        `Транзакция на ${amountTON} TON для ${recipientWallet} отправлена, seqno: ${seqno}`,
      );
      // Ждем подтверждения
      let confirmed = false;
      for (let i = 0; i < 20; i++) {
        // Проверяем 20 раз, ~40 секунд
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Ждем 2 секунды
        const newSeqno = await contract.getSeqno();

        if (newSeqno > seqno) {
          confirmed = true;
          logger.info(
            `Транзакция на ${amountTON} TON для ${recipientWallet} подтверждена, новый seqno: ${newSeqno}`,
          );
          break;
        }
      }
      if (!confirmed) {
        logger.warn(
          `Транзакция на ${amountTON} TON для ${recipientWallet} не подтверждена`,
        );
        return { isSuccess: false, reason: "not confirmed" };
      }
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
  recipientWallet: string,
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
        to: recipientWallet,
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
