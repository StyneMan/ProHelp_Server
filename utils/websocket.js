import Chat from "../model/Chat.model.js";
import Message from "../model/Message.model.js";

class WebSockets {
  constructor() {
    // Initialize the usersArr property as an empty array
    this.usersArr = [];
    // this.subscribeOtherUser = this.subscribeOtherUser.bind(this);
  }

  connection(client) {
    console.log("Connection established");

    // add identity of user mapped to the socket id
    client.on("identity", (userId) => {
      console.log("USER IDENTITY >> ", userId);
      this.usersArr?.push({
        socketId: client.id,
        userId: userId,
      });
    });

    client.on("setup", (userData) => {
      console.log("SETUP_USER_DATA :: ", userData);
      client.join(userData.id);
      client.emit("userConnected");
    });

    client.on("join chat", (room) => {
      client.join(room);
      console.log("User Joined Room: " + room);
    });

    client.on("typing", (room) => client.in(room).emit("typing"));
    client.on("stop typing", (room) => client.in(room).emit("stop typing"));

    client.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved?.chat;
      console.log("NEW MSG GOTTEN ::: ", newMessageRecieved);
      if (!chat?.users) return console.log("chat.users not defined");

      chat.users.forEach((user) => {
        console.log("USER DATA ::: ", user);
        if (user === newMessageRecieved?.sender?.id) return;

        client.in(user).emit("message recieved", newMessageRecieved);
      });
    });

    // client.on("connect", () => console.log("Socket is connected ahooo!!!"));

    // event fired when the chat room is disconnected
    client.on("disconnect", () => {
      this.usersArr = this.usersArr?.filter(
        (user) => user.socketId !== client.id
      );
    });

    client.on("checkOnline", (userId) => {
      console.log("ONLINE IDENTITY >> ", userId);
      let found = this.usersArr?.filter((user) => user?.userId === userId);
      console.log("ONL >> ", found);
      client.emit("isOnline", { data: found });
    });

    client.on("isRead", (data) => {
      console.log("IS READ DATA >>>", data);
      let chatId = data?.chatId;
      //Handle mark as read

      Chat.findOne({ _id: chatId })
        .then(async (cht) => {
          if (!cht) {
            return;
          }

          if (data?.sender === "") {
          }

          let result = await Chat.findOneAndUpdate(
            { _id: chatId },
            { $pull: { unreadMsgs: { receiverId: data?.reader } } },
            {
              new: true,
            }
          );

          //Now mark all messages with this chat is as read
          Message.updateMany(
            { chatId: chatId, "receiver.id": data?.reader },
            { isRead: true }
          )
            .then((msg) => {
              client.in(chatId).emit("message-read", {
                message: "Message is read",
                data: result,
              });
            })
            .catch((error) => console.log("ERROR INNER CHAT READ", error));
        })
        .catch((error) => console.log("ERROR CHAT READ", error));
    });

    // subscribe person to chat & other user as well
    client.on("subscribe", (data) => {
      console.log("SUBSCRIBED DATA:: ", data);
      subscribeOtherUser(this.usersArr, data.room, data.otherUser);
      // client.join(data.room);
      // this.subscribeOtherUser(data.room, data.otherUser);
      client.join(data.room);
    });

    // mute a chat room
    client.on("unsubscribe", (room) => {
      client.leave(room);
    });

    client.emit("FromAPI", "The data from server to you!!!");
  }
}

function subscribeOtherUser(usersArr, room, otherUserId) {
  const userSockets = usersArr?.filter((user) => user.userId === otherUserId);
  userSockets?.forEach((userInfo) => {
    const socketConn = global.io.sockets.connected[userInfo.socketId];
    if (socketConn) {
      socketConn.join(room);
    }
  });
}

export default new WebSockets();
