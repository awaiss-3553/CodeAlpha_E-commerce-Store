import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function listProducts(req, res, next) {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}