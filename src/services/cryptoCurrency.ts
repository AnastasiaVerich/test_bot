import axios from "axios";
import { convertApiKey } from "../config/env";
import logger from "../lib/logger";
import { upsertCommonVariable } from "../database/queries_kysely/common_variables";

// Конфигурация

export async function cryptoCurrency(): Promise<void> {
  try {
    const res = await getTonRubPrice();
    if (res) {
      await upsertCommonVariable("ton_rub_price", res?.toFixed(2).toString());
    }
  } catch (error) {
    logger.info("Error cryptoCurrency", error);
  }
}

const BASE_URL = "https://pro-api.coinmarketcap.com/v1";
// Функция для получения курса TON/RUB
async function getTonRubPrice(): Promise<number | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/cryptocurrency/quotes/latest`,
      {
        params: { symbol: "TON", convert: "RUB" },
        headers: { "X-CMC_PRO_API_KEY": convertApiKey },
      },
    );
    const data = response.data;

    if (data.status.error_code === 0) {
      return data.data.TON.quote.RUB.price;
    } else {
      logger.info("Ошибка API:", data.status.error_message);
      return null;
    }
  } catch (error) {
    logger.info("Ошибка запроса:", error);
    return null;
  }
}
