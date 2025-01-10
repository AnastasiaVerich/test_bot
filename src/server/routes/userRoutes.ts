import { Router } from "express";
import multer from "multer";
import { registration } from "../controllers/userController/registration";

const router = Router();

// Настройка multer для загрузки изображений
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Маршруты
router.post("/registration", upload.single("photo"), (req, res) => {
  void registration(req, res); // Оборачиваем вызов в void
});

export default router;
