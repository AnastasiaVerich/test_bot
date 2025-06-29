import schedule from "node-schedule";
import { executePendingPayments } from "../services/paymentService";
import { resetReservedSurveysService } from "../services/reservedSurveysService";
import { cryptoCurrency } from "../services/cryptoCurrency";
import { resetMediaAfterNDays } from "../services/resetMediaAfterNDays";

schedule.scheduleJob("*/5 * * * *", executePendingPayments); // в 1 мин
//schedule.scheduleJob("0 */2 * * *", resetMediaAfterNDays); // в  2 часа
schedule.scheduleJob("*/1 * * * *", resetMediaAfterNDays); // в  2 часа
schedule.scheduleJob("*/1 * * * *", resetReservedSurveysService); // в 1 мин
schedule.scheduleJob("*/5 * * * *", cryptoCurrency); // в 5 мин
