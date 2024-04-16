import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const MessageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.plugin(mongoosePaginate);

export default mongoose.model("Message", MessageSchema);
