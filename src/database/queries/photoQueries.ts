import { db } from "../dbClient";

interface Photo {
  photo_id: number;
  user_id: number;
  image: Buffer; // Для хранения изображения в формате BYTEA

  created_at: string; // Дата и время в ISO формате
}

export const addPhoto = async (
  userId: number,
  image: Buffer,
): Promise<void> => {
  try {
    const query = "INSERT INTO photos (user_id, image) VALUES ($1, $2)";
    await db.query(query, [userId, image]);
  } catch (error) {

    throw new Error("Error addPhoto: " + error);
  }
};
