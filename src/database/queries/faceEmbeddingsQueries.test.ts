import { db } from "../dbClient";
import {
  getAllFaceEmbeddings,
  getFaceEmbeddingByUserId,
  addFaceEmbedding,
} from "./faceEmbeddingsQueries";

jest.mock("../dbClient");

describe("Face Embeddings Queries", () => {
  describe("getAllFaceEmbeddings", () => {
    // Проверяем, что функция возвращает все эмбеддинги
    it("Should return all face embeddings", async () => {
      const mockEmbeddings = [
        {
          face_embedding_id: 1,
          user_id: 12345,
          embedding: '{"vector": [0.1, 0.2, 0.3]}',
          created_at: "2022-01-01T00:00:00Z",
        },
        {
          face_embedding_id: 2,
          user_id: 67890,
          embedding: '{"vector": [0.4, 0.5, 0.6]}',
          created_at: "2022-01-02T00:00:00Z",
        },
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockEmbeddings });

      const result = await getAllFaceEmbeddings();
      expect(result).toEqual(mockEmbeddings);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM face_embeddings");
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getAllFaceEmbeddings()).rejects.toThrow(
        "Error getAllFaceEmbeddings: Database error",
      );
    });
  });

  describe("getFaceEmbeddingByUserId", () => {
    // Проверяем, что функция возвращает эмбеддинг по user_id
    it("Should return face embedding by user_id", async () => {
      const mockEmbedding = {
        face_embedding_id: 1,
        user_id: 12345,
        embedding: '{"vector": [0.1, 0.2, 0.3]}',
        created_at: "2022-01-01T00:00:00Z",
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockEmbedding] });

      const result = await getFaceEmbeddingByUserId(12345);
      expect(result).toEqual(mockEmbedding);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM face_embeddings WHERE user_id = $1",
        [12345],
      );
    });

    // Проверяем, что функция возвращает null, если эмбеддинг не найден
    it("Should return null if no embedding exists for the given user_id", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await getFaceEmbeddingByUserId(12345);
      expect(result).toBeNull();
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      await expect(getFaceEmbeddingByUserId(12345)).rejects.toThrow(
        "Error getFaceEmbeddingByUserId: Database error",
      );
    });
  });

  describe("addFaceEmbedding", () => {
    // Проверяем, что эмбеддинг успешно добавляется
    it("Should successfully add a face embedding", async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({});

      const buffer = new ArrayBuffer(16);
      const embedding = new Float32Array(buffer);

      embedding[0] = 1.0;
      embedding[1] = 2.5;
      embedding[2] = 3.14;
      embedding[3] = 4.2;

      await addFaceEmbedding(12345, JSON.stringify(embedding, null, 2));

      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO face_embeddings (user_id, embedding, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)",
        [12345, JSON.stringify(JSON.stringify(embedding, null, 2))],
      );
    });

    // Проверяем, что функция выбрасывает ошибку, если запрос не удался
    it("Should throw an error if query fails", async () => {
      const error = new Error("Database error");
      (db.query as jest.Mock).mockRejectedValueOnce(error);

      const embedding = { vector: [0.1, 0.2, 0.3] };

      await expect(
        addFaceEmbedding(12345, JSON.stringify(embedding)),
      ).rejects.toThrow("Error addFaceEmbedding: Database error");
    });
  });
});
