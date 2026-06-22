import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const palette = ["#2f80ed", "#00a884", "#8b5cf6", "#f97316", "#e11d48", "#0891b2"];

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: passwordHash,
      avatarColor: palette[Math.floor(Math.random() * palette.length)]
    });

    res.status(201).json({
      token: createToken(user._id),
      user
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: createToken(user._id),
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
