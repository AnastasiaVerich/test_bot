import {Express} from 'express';
import bodyParser from 'body-parser';

export const configureExpress = (app:Express) => {
    // ограничивает размер запросов с телом в формате JSON
    app.use(bodyParser.json({ limit: '10mb' }));
};
