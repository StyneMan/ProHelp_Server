import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import mongoosePaginate from "mongoose-paginate-v2"; 

export const ChatSchema = mongoose.Schema(
  {
    isGroupChat:  { type: Boolean, default: false },
    chatName: { type: String, trim: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ChatSchema.plugin(mongoosePaginate);

ChatSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

export default mongoose.model("Chat", ChatSchema);
