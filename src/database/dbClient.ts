import { Pool } from "pg";
import {DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER} from "../config/env";

export const db = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
});

db.on("connect", () => {
    console.log("Подключение к базе данных установлено");
});

db.on("error", (err) => {
    console.error("Ошибка подключения к базе данных:", err);
});
