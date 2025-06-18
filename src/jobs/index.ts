import schedule from "node-schedule";
import { executePendingPayments } from "../services/paymentService";
import { resetReservedSurveysService } from "../services/reservedSurveysService";
import { cryptoCurrency } from "../services/cryptoCurrency";
import { deleteMediaAfter30Days } from "../services/deleteMediaAfter30Days";

schedule.scheduleJob("*/1 * * * *", executePendingPayments); // в 1 мин
schedule.scheduleJob("0 */2 * * *", deleteMediaAfter30Days); // в  2 часа
schedule.scheduleJob("*/1 * * * *", resetReservedSurveysService); // в 1 мин
schedule.scheduleJob("*/5 * * * *", cryptoCurrency); // в 5 мин
