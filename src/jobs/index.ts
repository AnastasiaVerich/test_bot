import schedule from "node-schedule";
import {executePendingPayments} from "../services/paymentService";
import {resetReservedSurveysService} from "../services/reservedSurveysService";
import {cryptoCurrency} from "../services/cryptoCurrency";

schedule.scheduleJob("*/1 * * * *", executePendingPayments);
schedule.scheduleJob("*/1 * * * *", resetReservedSurveysService);
schedule.scheduleJob("*/5 * * * *", cryptoCurrency);

