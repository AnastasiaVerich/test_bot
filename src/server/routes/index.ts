import userRoutes from "./userRoutes";
import embeddingRoutes from "./embeddingRoutes";
import {Express} from "express";

export default (app:Express) => {
    app.use('/api/users', userRoutes);
    app.use('/api/embeddings', embeddingRoutes);
};
