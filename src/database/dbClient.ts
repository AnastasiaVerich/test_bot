import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const db = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'test2',
    password: 'test2',
    port: 5432,
});

db.on("connect", () => {
    console.log("Подключение к базе данных установлено");
});

db.on("error", (err) => {
    console.error("Ошибка подключения к базе данных:", err);
});
