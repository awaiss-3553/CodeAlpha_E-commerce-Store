import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("items is required and must be a non-empty array");
    }

    // Normalize & validate
    const normalized = items.map((it) => ({
      productId: Number(it.productId),
      quantity: Number(it.quantity)
    }));

    for (const it of normalized) {
      if (!it.productId || !Number.isInteger(it.productId)) {
        res.status(400);
        throw new Error("Each item must have a valid productId");
      }
      if (!it.quantity || it.quantity < 1) {
        res.status(400);
        throw new Error("Each item must have quantity >= 1");
      }
    }

    const productIds = normalized.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      res.status(400);
      throw new Error("One or more products do not exist");
    }

    // Build order items with server-trusted pricing
    const orderItems = normalized.map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return {
        productId: p.id,
        quantity: i.quantity,
        unitPrice: p.price
      };
    });

    // Check stock
    for (const oi of orderItems) {
      const p = products.find((x) => x.id === oi.productId);
      if (p.stock < oi.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${p.title}`);
      }
    }

    const totalAmount = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Reduce stock
      for (const oi of orderItems) {
        await tx.product.update({
          where: { id: oi.productId },
          data: { stock: { decrement: oi.quantity } }
        });
      }

      // Create order + items
      return tx.order.create({
        data: {
          userId,
          status: "PAID",
          totalAmount,
          items: { create: orderItems }
        },
        include: { items: { include: { product: true } } }
      });
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function myOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: true } } }
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, user: true }
    });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.userId !== userId) {
      res.status(403);
      throw new Error("Forbidden");
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
}