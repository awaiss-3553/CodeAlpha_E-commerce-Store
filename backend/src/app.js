import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
