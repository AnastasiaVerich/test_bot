import {db} from "../dbClient";
import {QueryResult} from "pg";

interface FaceEmbedding {
    face_embedding_id: number;
    user_id: number;
    embedding: string;  // Данные в формате JSONB
    created_at: string;  // Дата и время в ISO формате
}
// Функция для получения всех эмбеддингов
export const getAllFaceEmbeddings = async (): Promise<FaceEmbedding[]> => {
    try {
        const query = 'SELECT * FROM face_embeddings';
        const result: QueryResult<FaceEmbedding> = await db.query(query);
        return result.rows;
    } catch (error) {
        console.log('Error getAllFaceEmbeddings:', error);
        throw new Error('Error getAllFaceEmbeddings');
    }
};

// Функция для получения эмбеддинга по face_embedding_id
export const getFaceEmbeddingByUserId = async (userId: number): Promise<FaceEmbedding | null> => {
    try {
        const query = 'SELECT * FROM face_embeddings WHERE user_id = $1';
        const result: QueryResult<FaceEmbedding> = await db.query(query, [userId]);
        return result.rows[0] ?? null;
    } catch (error) {
        console.log('Error getFaceEmbeddingByUserId:', error);
        throw new Error('Error getFaceEmbeddingByUserId');
    }
};

// Функция для добавления нового эмбеддинга
export const addFaceEmbedding = async (userId: number, embedding: string): Promise<void> => {
    try {
        const query = 'INSERT INTO face_embeddings (user_id, embedding, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)';
        await db.query(query, [userId, JSON.stringify(embedding)]);
    } catch (error) {
        console.error('Error addFaceEmbedding:', error);
        throw new Error('Error addFaceEmbedding');
    }
};

