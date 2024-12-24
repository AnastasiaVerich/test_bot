import { Router } from 'express';
import multer from 'multer';
import {identification} from "../controllers/embeddingController/identification";

const router = Router();

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Маршрут для верификации
router.post('/identification', upload.single('photo'), identification);

export default router;
