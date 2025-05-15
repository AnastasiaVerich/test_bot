import {Client, ClientConfig, Pool, types} from "pg";
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "../config/env";
import logger from "../lib/logger";
import {Kysely, PostgresDialect} from "kysely";
import {Database} from "./db-interface";

export const pgConfig: ClientConfig = {
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
};
types.setTypeParser(20, (val: string) => {
  return parseInt(val, 10);
});

const dialect = new PostgresDialect({
  pool: new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: Number(DB_PORT),
  }),
});
export type poolType = Kysely<Database>

export const pool = new Kysely<Database>({ dialect });

export const db = new Pool(pgConfig);
export const client = new Client(pgConfig);



db.on("connect", () => {
});

db.on("error", (error) => {


  logger.error("Ошибка подключения к базе данных: " + error);
});
