import schedule from "node-schedule";
import { executePendingPayments } from "../services/paymentService";

// Запускаем задачу каждые 10 минут по отправке отплаты
schedule.scheduleJob("*/1 * * * *", executePendingPayments);
