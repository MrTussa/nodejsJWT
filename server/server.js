// app.js

import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cors from "cors";

import UserModel from "./models/User.js";
import TodoModel from "./models/Todo.js";
import bcrypt from "bcrypt";
import verifyToken from "./middleware/verifyToken.js";

const secretKey = "lafhasdkfjhwersdaflgkka";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.a3a9pqj.mongodb.net/todo?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

const registerUser = (req, res, next) => {
  try {
    const { email, password } = req.body;
    bcrypt.hash(password, 10, async (err, hash) => {
      const newUser = new UserModel({
        ...req.body,
        password: hash,
      });
      const uniqueEmail = await UserModel.findOne({ email });
      if (uniqueEmail) {
        return res.status(400).json({ error: "Этот email уже занят" });
      }
      await newUser.save();
      next();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

app.use("/api/register", registerUser);
app.use("/api/todo", verifyToken);

app.post("/api/login", async (req, res) => {
  const { password, email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user || !password) {
    res.status(400).json({ error: "Email не найден" });
  }
  const isAuth = bcrypt.compare(password, user.password);
  if (isAuth) {
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } else {
    res.status(401).send("Неверные учетные данные");
  }
});

app.post("/api/register", registerUser, (req, res) => {
  res.status(201).json({ succes: "User registered" });
});
app.get("/api/todo", verifyToken, async (req, res) => {
  const userId = req.userId;
  const todos = await TodoModel.find({ userId });
  res.status(200).json({ todos });
});

app.post("/api/todo/add", verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.userId;

    const newTodo = new TodoModel({
      title: title,
      description: description,
      isCompleted: false,
      userId: userId,
    });
    await newTodo.save();
    res.status(201).json({ succes: "Todo created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/todo/delete", verifyToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.userId;

    await TodoModel.deleteOne({ title, userId });
    res.status(202).json({ success: "Todo удален" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/todo/update", verifyToken, async (req, res) => {
  const { title } = req.body;
  const userId = req.userId;

  try {
    const todoMongo = await TodoModel.findOne({ title, userId });

    if (!todoMongo) {
      return res.status(404).json({ error: "Todo не найден" });
    }

    todoMongo.isCompleted = !todoMongo.isCompleted;
    await todoMongo.save();

    res.status(201).json({ success: "Todo обновлен" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
