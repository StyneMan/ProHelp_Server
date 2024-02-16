import User from '../model/User.model.js'
import Chat from '../model/Chat2.model.js'
import Message from '../model/Message2.model.js'

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
export async function allMessages (req, res) {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name pic email')
      .populate('chat')
    res.json(messages)
  } catch (error) {
    res.status(400).send({ message: error?.message })
  }
}

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
export async function sendMessage (req, res) {
  const { content, chatId } = req.body

  console.log('USER :-:-: ', req.user?._id.toString())
  // console.log("CHAT ID ", chatId);

  if (!content || !chatId) {
    console.log('Invalid data passed into request')
    return res.sendStatus(400)
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId
  }

  try {
    const chatRoom = await Chat.findOne({ _id: chatId })
    console.log('CHAT ROOM :: ', chatRoom)

    if (chatRoom) {
      chatRoom?.users?.forEach(element => {
        if (req.user?._id.toString() === element?.toString()) {
          console.log('FOUND USER ID :: ')
        } else {
          console.log('NO USER FOUND ::: ')
          if (element === null) {
            console.log('NUll HERE')
            console.log('THER OTHER USER :: ', req.user?._id)
            element = req.user?._id

            // const indexToReplace = chatRoom?.users.indexOf(null)

            // Replace null with new ObjectId
            // if (indexToReplace !== -1) {
            //   chatRoom?.users[indexToReplace] = req.user?._id
            // }
          }
        }
      })
    }

    var message = await Message.create(newMessage)

    // Define the populate options for sender, chat, and chat.users
    const populateOptions = [
      { path: 'sender', select: 'bio email' },
      { path: 'chat' },
      { path: 'chat.users', select: 'bio id email' }
    ]

    // message = await message.populate("sender", "bio email").execPopulate();
    // message = await message.populate("chat").execPopulate();
    // message = await User.populate(message, {
    //   path: "chat.users",
    //   select: "bio id email",
    // });

    // Create a Mongoose query and populate the fields
    message = await Message.findById(message._id).populate(populateOptions)

    // Update the latestMessage in the Chat model
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message })

    res.json(message)

    // await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // res.json(message);
  } catch (error) {
    console.log('HKDH :: :', error)
    res.status(400).send({ message: error.message })
  }
}
