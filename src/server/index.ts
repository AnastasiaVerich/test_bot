import express from 'express';
import cors from 'cors';
import configureRoutes from './routes';
import {corsOptions} from "./config/corsConfig";
import {configureExpress} from "./config/expressConfig";
import {initializeModels} from "./services/modelLoader";
import {PORT} from "../config/env";

// Создаём приложение Express
const app = express();
const port = PORT || 3000;

//Настройка CORS
app.use(cors(corsOptions));
//Настройки Express
configureExpress(app);
// Функция для загрузки моделей
initializeModels()

// Маршруты
configureRoutes(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
