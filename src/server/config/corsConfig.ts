import {CORS_URL} from "../../config/env";
// Определяем список разрешённых источников для CORS
const allowedOrigins = CORS_URL;
// Конфигурация CORS
export const corsOptions = {
    origin: (origin: string | undefined, callback: (err: (Error | null), origin?: boolean) => void) => {

        // Если origin пустой (например, при запросах с серверов или в тестах), разрешаем
        if (!origin) return callback(null, true);

        // Проверка, если origin в списке разрешенных источников
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
};
