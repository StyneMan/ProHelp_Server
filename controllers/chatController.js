import User from "../model/User.model.js";
import Chat from "../model/Chat.model.js";
import Message from "../model/Message.model.js";

export async function initiateChat(req, res) {
  try {
    const { userIds, chatInitiator, initiator, receiver } = req.body;

    const availableRoom = await Chat.findOne({
      userIds: {
        $size: userIds?.length,
        $all: [...userIds],
      },
    });

    if (availableRoom) {
      global.io.in(chatInitiator).emit("new-chat", { message: availableRoom });
      return res.status(200).send({
        success: true,
        message: "Retrieving an old chat room",
        data: {
          isNew: false,
          chatId: availableRoom._doc._id,
          initiator: availableRoom._doc.initiator,
          receiver: availableRoom._doc.receiver,
        },
      });
    }

    const newRoom = await Chat.create({
      userIds,
      chatInitiator,
      initiator,
      receiver,
    });
    global.io.in(chatInitiator).emit("new-chat", { message: newRoom });
    return res.status(200).send({
      success: true,
      message: "Creating a new chat room",
      data: {
        isNew: true,
        chatId: newRoom._doc._id,
        initiator: newRoom._doc.initiator,
        receiver: newRoom._doc.receiver,
      },
    });
  } catch (error) {
    console.log("error on start chat method", error);
    throw error;
  }
}

export async function getChatsByUser(req, res) {
  try {
    const { userId } = req.query;

    // const rooms = await Chat.find({ userIds: { $all: [userId] } });
    // const userIds = rooms.
    // rooms.

    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25,
    };

    const chats = await Chat.aggregate([
      { $match: { userIds: { $in: [userId] } } },
      { $sort: { updatedAt: -1 } },
      // pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { updatedAt: 1 } },
    ]);

    return res.status(200).send({
      success: true,
      message: "",
      data: chats,
    });
  } catch (error) {
    console.log("ERROR", error);
    throw new Error(error);
  }
}

export async function getChatById(req, res) {
  try {
    const { chatId } = req.query;

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      return res.status(404).send({
        success: false,
        message: "Chat not found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "",
      data: chat,
    });
  } catch (error) {
    console.log("ERROR", error);
    throw new Error(error);
  }
}

export async function postMessage(req, res) {
  const { message, chatId, receiver, sender } = req.body;
  try {
    const post = await Message.create({
      chatId,
      message,
      sender,
      receiver,
    });

    await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $push: {
          unreadMsgs: {
            senderId: sender?.id,
            message: message,
            receiverId: receiver?.id,
          },
        },
        $set: { recentMessage: message },
      },
      {
        new: true,
      }
    );

    global.io
      .in(chatId)
      .emit("new-message", { senderId: sender?.id, message: post });
    // console.log("CHECK  GLOBAL SOCKET INSTANCE ", JSON.stringify(post));
    return res.status(200).send({ success: true, post });
    // const aggregate = await Message.aggregate([
    //   // get post where _id = post._id
    //   { $match: { _id: post._id } },
    //   // do a join on another table called users, and
    //   // get me a user whose _id = postedByUser
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "sender.id",
    //       foreignField: "_id",
    //       as: "sender.id",
    //     },
    //   },
    //   { $unwind: "$sender.id" },
    //   // do a join on another table called chat, and
    //   // get me a chatroom whose _id = chatRoomId
    //   {
    //     $lookup: {
    //       from: "chats",
    //       localField: "chatId",
    //       foreignField: "_id",
    //       as: "chatInfo",
    //     },
    //   },
    //   { $unwind: "$chatInfo" },
    //   { $unwind: "$chatInfo.userIds" },
    //   // do a join on another table called users, and
    //   // get me a user whose _id = userIds
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "chatInfo.userIds",
    //       foreignField: "_id",
    //       as: "chatInfo.userProfile",
    //     },
    //   },
    //   { $unwind: "$chatInfo.userProfile" },
    //   // group data
    //   {
    //     $group: {
    //       _id: "$chatInfo._id",
    //       postId: { $last: "$_id" },
    //       chatId: { $last: "$chatInfo._id" },
    //       message: { $last: "$message" },
    //       postedByUser: { $last: "$postedByUser" },
    //       readByRecipients: { $last: "$readByRecipients" },
    //       chatRoomInfo: { $addToSet: "$chatRoomInfo.userProfile" },
    //       createdAt: { $last: "$createdAt" },
    //       updatedAt: { $last: "$updatedAt" },
    //     },
    //   },
    // ]);
    // return aggregate[0];
  } catch (error) {
    throw error;
  }
}

export async function getConversationByRoomId(req, res) {
  const { chatId } = req.query;
  try {
    const room = await Chat.findOne({ _id: chatId });
    if (!room) {
      return res.status(404).send({
        success: false,
        message: "No chat exists for this id",
      });
    }
    const users = await User.find({ _id: { $in: room.userIds } });

    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 25,
    };

    const conversation = await Message.aggregate([
      { $match: { chatId } },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and
      // get me a user whose _id = postedByUser
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "sender.id",
      //       foreignField: "_id",
      //       as: "sender",
      //     },
      //   },
      //   { $unwind: "$sender" },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } },
    ]);

    return res.status(200).send({
      success: true,
      conversation,
      users,
    });
  } catch (error) {
    return res.status(500).send({ success: false, error });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { messageId, chatId, sender } = req.body;

    // const chat = await ChatRoomModel.getChatRoomByRoomId(chatId);
    const msg = await Message.findOne({ _id: messageId });

    if (!msg) {
      return res.status(400).json({
        success: false,
        message: "No conversation exists for this id",
      });
    }

    // const result = await Message.deleteOne({ _id: messageId });

    let result = await Message.findOneAndUpdate(
      { _id: messageId },
      { $set: { isDeleted: true } },
      {
        new: true,
      }
    );

    global.io
      .in(chatId)
      .emit("is-deleted", { messageId: messageId, message: result });

    return res
      .status(200)
      .json({
        success: true,
        message: "You just deleted a conversation",
        data: result,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
}
