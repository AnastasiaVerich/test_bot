import dotenv from "dotenv";

dotenv.config();
/* eslint-disable no-process-env */
//экспортируем переменные окружения
export const WEB_APP_URL = process.env.WEB_APP_URL ?? "";
export const token = process.env.BOT_TOKEN ?? "";
export const seed_phrase = process.env.SEED_PHRASE ?? "";

export const DB_USER = process.env.DB_USER ?? "";
export const DB_HOST = process.env.DB_HOST ?? "";
export const DB_DATABASE = process.env.DB_DATABASE ?? "";
export const DB_PASSWORD = process.env.DB_PASSWORD ?? "";
export const DB_PORT = process.env.DB_PORT ?? "";

export const PORT = process.env.SERVER_PORT || 3000;
export const NODE_ENV = (process.env.NODE_ENV as "dev" | "prod") || "dev";
export const CORS_URL = process.env.SERVER_CORS_URL
  ? process.env.SERVER_CORS_URL.split(",")
  : [];
