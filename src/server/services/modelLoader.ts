// Функция для загрузки моделей
import path from "path";
import * as faceapi from "@vladmandic/face-api";
import logger from "../../lib/logger";

export async function loadModels(): Promise<void> {
  const modelsPath = path.join(__dirname, "ia_models");

  // Загружаем модели для обнаружения лиц, маркировки и эмбеддингов
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath); // Обнаружение лиц
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath); // Маркировка лиц
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath); // Эмбеддинги
}

export const initializeModels = async (): Promise<void> => {
  try {
    await loadModels();
  } catch (error) {
    logger.error("Ошибка при загрузке моделей: " + error);
  }
};
