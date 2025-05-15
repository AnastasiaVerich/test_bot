import express from "express";
import cors from "cors";
import configureRoutes from "./routes";
import { corsOptions } from "./config/corsConfig";
import { configureExpress } from "./config/expressConfig";
import { initializeModels } from "./services/modelLoader";
import { PORT } from "../config/env";
import logger from "../lib/logger";

// Создаём приложение Express
const app = express();
const port = PORT || 3000;

//Настройка CORS
app.use(cors(corsOptions));
//Настройки Express
configureExpress(app);
// Функция для загрузки моделей
void initializeModels();

// Маршруты
configureRoutes(app);

app.listen(port, () => {});
