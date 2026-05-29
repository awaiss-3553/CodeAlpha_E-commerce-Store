import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email, password are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    const token = signToken(user.id);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400);
      throw new Error("email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = signToken(user.id);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      token
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
