import schedule from 'node-schedule';
import {executePendingPayments} from "../services/paymentService";

// Запускаем задачу каждые 10 минут по очистке резервации опросов
schedule.scheduleJob('*/10 * * * *', executePendingPayments);
