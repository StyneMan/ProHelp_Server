const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

 const MessageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Message", MessageSchema);
