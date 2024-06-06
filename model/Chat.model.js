const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ChatSchema = mongoose.Schema(
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

module.exports = mongoose.model("Chat", ChatSchema);
