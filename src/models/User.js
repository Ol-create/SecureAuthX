import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "MODERATOR"],
      default: "USER",
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
