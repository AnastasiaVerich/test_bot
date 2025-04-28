import { Request, Response } from "express";
import { detectFaces, findDistance } from "../../services/embeddingService";
import { InterfaceResponse } from "../../types/type";
import { checkExistInBlockUser } from "../../../database/queries/blacklistUsersQueries";
import { findOperator } from "../../../database/queries/operatorQueries";
import { getFaceEmbeddingByUserId } from "../../../database/queries/faceEmbeddingsQueries";
import { IdentificationResponseText } from "../../../config/common_types";
import logger from "../../../lib/logger";

// Интерфейс для тела запроса
interface IdentificationRequestBody extends Request {
  userId: string; // Уникальный идентификатор пользователя
  // eslint-disable-next-line no-undef
  file: Express.Multer.File; // Файл изображения, загруженный с помощью Multer
}

// Тип, который перечисляет все возможные значения для поля text

// Интерфейс для ответа от сервера
type IdentificationResponse = InterfaceResponse<IdentificationResponseText>;

// Верификации фото пользователя с уже добавленным фото в БД
export const identification = async (
  req: Request<object, object, IdentificationRequestBody>,
  res: Response<IdentificationResponse>,
): Promise<Response<IdentificationResponse>> => {
  try {
    const userId = Number(req.body.userId);

    // Проверка наличия обязательных полей
    if (!req.file) {
      return res.status(400).send({ status: 2, text: "missing_photo" });
    }
    if (!userId || typeof userId !== "number") {
      return res.status(400).send({
        status: 2,
        text: "missing_user_id",
      });
    }

    const isBlockUser = await checkExistInBlockUser(userId, null);
    const isOperator = await findOperator(userId, null, null);

    // Если пользователь с таким ID заблокирован
    if (isBlockUser || isOperator) {
      return res.status(200).send({ status: 0, text: "user_is_block" });
    }
    // Определение лиц на изображении
    const detections = await detectFaces(req.file.buffer);

    // Если на изображении не найдено лиц
    if (detections.length === 0) {
      return res.status(200).send({ status: 2, text: "face_not_found" });
    }

    // Получение эмбеддинга для пользователя из базы данных по userId
    const embeddingFromDB = await getFaceEmbeddingByUserId(userId);

    // Если эмбеддинг для пользователя не найден в базе
    if (!embeddingFromDB) {
      return res.status(200).send({ status: 0, text: "embedding_not_found" });
    }

    // Получаем эмбеддинг лица с изображения (так как на фото может быть несколько лиц, берем первое)
    const faceEmbedding = detections[0].descriptor;

    // Рассчитываем расстояние между эмбеддингом с изображения и эмбеддингом из базы
    const distance = findDistance(
      faceEmbedding,
      Object.values(JSON.parse(embeddingFromDB.embedding)),
    );

    // Если расстояние между эмбеддингами меньше порогового значения (0.6), то считаем, что лицо совпало
    if (distance < 0.6) {
      return res.status(200).send({ status: 1, text: "success" });
    }
    // Если эмбеддинги не совпали, возвращаем ошибку
    return res
      .status(200)
      .send({ status: 0, text: "similarity_not_confirmed" });
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error Identification: " + shortError);
    return res.status(500).send({ status: 2, text: "server_error" });
  }
};
