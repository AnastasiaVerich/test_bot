import { Express } from "express";
import userRoutes from "./userRoutes";
import embeddingRoutes from "./embeddingRoutes";

export default (app: Express): void => {
  app.use("/api/users", userRoutes);
  app.use("/api/embeddings", embeddingRoutes);
};
