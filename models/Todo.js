import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    todo: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ссылка на модель пользователя
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Todo", TodoSchema);
