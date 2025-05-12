import {Client, ClientConfig, Pool} from "pg";
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "../config/env";
import logger from "../lib/logger";

export const pgConfig: ClientConfig = {
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
};


export const db = new Pool(pgConfig);
export const client = new Client(pgConfig);



db.on("connect", () => {
});

db.on("error", (error) => {


  logger.error("Ошибка подключения к базе данных: " + error);
});
