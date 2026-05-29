import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { createOrder, myOrders, getOrder } from "../controllers/orders.controller.js";

const router = Router();

router.post("/", authRequired, createOrder);
router.get("/my", authRequired, myOrders);
router.get("/:id", authRequired, getOrder);

export default router;