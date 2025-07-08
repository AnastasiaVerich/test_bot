import { Request, Response } from "express";
import { detectFaces, findDistance } from "../../services/embeddingService";
import { InterfaceResponse } from "../../types/type";
import { db } from "../../../database/dbClient";
import { RegistrationResponseText } from "../../../config/common_types";
import logger from "../../../lib/logger";
import { isUserInBlacklist } from "../../../database/queries_kysely/blacklist_users";
import {
  addFaceEmbedding,
  getAllFaceEmbeddings,
} from "../../../database/queries_kysely/face_embedding";
import { getOperatorByIdPhoneOrTg } from "../../../database/queries_kysely/operators";
import { addUser, getUser } from "../../../database/queries_kysely/users";
import { addPhoto } from "../../../database/queries_kysely/photos";
import { addSimilarUser } from "../../../database/queries_kysely/similar_users";

// Интерфейс для тела запроса на регистрацию
interface RegistrationRequestBody {
  userId: string; // Уникальный идентификатор пользователя
  userPhone: string; // Телефон пользователя
  isSavePhoto: "0" | "1"; // Флаг: сохранять фото или нет
  file: Blob; // Файл изображения, загруженный с помощью Multer
}

// Интерфейс для ответа от сервера
type RegistrationResponse = InterfaceResponse<RegistrationResponseText>;

// Регистрация нового пользователя
export const registration = async (
  req: Request<object, object, RegistrationRequestBody>,
  res: Response<RegistrationResponse>,
): Promise<Response<RegistrationResponse>> => {
  try {
    const client = await db.connect(); // Получение соединения с базой данных
    try {
      await client.query("BEGIN"); // Начинаем транзакцию

      const { userPhone, isSavePhoto } = req.body;
      const userId = Number(req.body.userId);
      // Проверка наличия обязательных полей
      if (!req.file || !req.file.mimetype.startsWith("image/")) {
        return res.status(400).send({ status: 2, text: "missing_photo" });
      }
      if (!userId || typeof userId !== "number") {
        return res.status(400).send({
          status: 2,
          text: "missing_user_id",
        });
      }
      if (!userPhone || typeof userPhone !== "string") {
        return res.status(400).send({
          status: 2,
          text: "missing_user_phone",
        });
      }

      // Сохраняем фото, если флаг `isSavePhoto` равен '1'
      if (isSavePhoto === "1") {
        await addPhoto(userId, req.file.buffer);
      }

      // Проверяем существование пользователя по номеру телефона и ID
      const isHasSomeNumberUser = await getUser({ phone: userPhone });
      const isHasSomeIdUser = await getUser({ user_id: userId });
      const isBlockUser = await isUserInBlacklist({
        account_id: userId,
        phone: userPhone,
      });
      const isOperator = await getOperatorByIdPhoneOrTg({
        operator_id: userId,
        phone: userPhone,
      });

      // Если пользователь с таким номером телефона уже существует
      if (isHasSomeNumberUser) {
        return res.status(200).send({ status: 0, text: "user_exist_number" });
      }

      // Если пользователь с таким ID уже существует
      if (isHasSomeIdUser) {
        return res.status(200).send({ status: 0, text: "user_exist_id" });
      }

      // Если пользователь с таким ID или телефоном заблокирован
      if (isBlockUser || isOperator) {
        return res.status(200).send({ status: 0, text: "user_is_block" });
      }

      // Определение лиц на изображении
      const detections = await detectFaces(req.file.buffer);

      // Если лицо не найдено
      if (detections.length === 0) {
        return res.status(200).send({ status: 2, text: "face_not_found" });
      }

      // Получение всех эмбеддингов из базы данных
      const embeddingsFromDB = await getAllFaceEmbeddings();

      // Вектор эмбеддинга для текущего изображения
      const currentEmbedding = detections[0].descriptor;

      // Сравнение с существующими эмбеддингами
      const matches: { user_id: number; distance: number }[] = [];
      for (const row of embeddingsFromDB) {
        const distance = findDistance(
          currentEmbedding,
          Object.values(JSON.parse(JSON.stringify(row.embedding))),
        );
        if (distance < 0.45) {
          // Пороговое значение для сравнения
          await addSimilarUser(userId, row.user_id);
          matches.push({ user_id: row.user_id, distance });
        }
      }

      // Если лицо совпадает с уже существующим
      if (matches.length > 0) {
        return res
          .status(200)
          .send({ status: 0, text: "user_exist_face", matches });
      }

      // Добавляем нового пользователя в таблицу users
      await addUser({
        userId: userId,
        userPhone: userPhone,
      });

      // Сохраняем эмбеддинг лица в таблице face_embeddings
      await addFaceEmbedding(userId, JSON.stringify(currentEmbedding, null, 2));

      await client.query("COMMIT"); // Фиксируем транзакцию
      return res.status(200).send({ status: 1, text: "success" });
    } catch (error) {
      console.log(error);
      logger.error("Error registration 2: " + error);
      await client.query("ROLLBACK"); // Откатываем транзакцию в случае ошибки
      return res.status(500).send({ status: 2, text: "server_error" });
    } finally {
      client.release(); // Освобождаем клиента
    }
  } catch (error) {
    console.log(error);
    logger.error("Error registration 1: " + error);
    return res.status(500).send({ status: 2, text: "server_error" });
  }
};
