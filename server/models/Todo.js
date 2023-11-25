import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
