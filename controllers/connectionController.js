import Support from '../model/Support.model.js'
import { v4 } from 'uuid'
import { sendConnectionRequestEmailNotice, sendSupportEmail } from './mailer.js'
import User from '../model/User.model.js'
import Alert from '../model/Alert.model.js'
import Connection from '../model/Connection.model.js'
import Transaction from '../model/Transaction.model.js'

const population = {
  path: 'user',
  select: '-password' // Exclude the password field
}

/** middleware for verify user */
export async function verifyUser (req, res, next) {
  try {
    const { email } = req.method == 'GET' ? req.query : req.body

    // check the user existance
    let exist = await User.findOne({ email })
    if (!exist)
      return res
        .status(404)
        .send({ success: false, message: 'Can not find user!' })
    next()
  } catch (error) {
    console.log('MERROR ', error)
    return res
      .status(404)
      .send({ success: false, message: 'Authentication error' })
  }
}

export async function sendConnectionRequest (req, res) {
  try {
    const { guestId, guestName, userId } = req.body
    const { email } = req.params

    const em = await User.findOne({ email })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })

    const guestUser = await User.findOne({ _id: guestId })

    if (!guestUser) {
      return res
        .status(404)
        .send({ success: false, message: 'Account does not exist' })
    }

    console.log('GUEST USER ::: ', guestUser)

    if (em.wallet?.balance >= 200) {
      User.findByIdAndUpdate(
        em?.id,
        {
          $push: {
            pendingSentConnect: guestId
          },
          $set: {
            'wallet.balance': em.wallet?.balance - 200,
            'wallet.prevBalance': em?.wallet?.balance,
            'wallet.updatedAt': new Date().toISOString()
          }
        },
        { new: true }
      )
        .then(async resp => {
          try {
            await new Transaction({
              user: em?.id,
              type: 'connection',
              amount: 200,
              summary: `You connected with ${em?.bio?.firstname} ${em?.bio?.lastname}`,
              status: 'success',
              reference: userId,
              createdAt: new Date().toISOString()
            }).save()

            await User.findByIdAndUpdate(
              guestUser?.id,
              {
                $push: {
                  pendingReceivedConnect: userId
                }
              },
              { new: true }
            )

            await new Connection({
              guest: guestId,
              status: 'pending',
              user: userId
            }).save()

            await sendConnectionRequestEmailNotice(
              em,
              'Connection Request',
              guestUser
            )

            await new Alert({
              type: 'connection',
              message: `You requested to connect to ${guestName}`,
              user: userId
            }).save()

            await new Alert({
              type: 'connection',
              message: `${em?.bio?.firstname} ${em?.bio?.middlename} ${em?.bio?.lastname} wants to connect`,
              user: guestId
            }).save()

            global.io.emit('connection-requested', {
              requestBy: em,
              user: guestUser,
              message: `${em?.bio?.firstname} ${em?.bio?.middlename} ${em?.bio?.lastname} requested to connect`
            })

            return res.status(200).send({
              success: true,
              message: 'Successfully sent connection request to ' + guestName
            })
          } catch (error) {
            console.log(error)
          }
        })
        .catch(error => {
          console.log('ERRO ::S ', error)
          return res.status(500).send({ error })
        })
    } else {
      return res.status(400).send({
        success: false,
        message: 'Low wallet balance. Please fund your wallet'
      })
    }
  } catch (error) {
    console.log('ERROR LIKING >>> ', error)
    throw new Error(error)
  }
}

export async function acceptConnectionRequest (req, res) {
  try {
    const { accepterId, userId } = req.body
    const { connectionId } = req.params

    if (!req.decoded) {
      throw new Error('You are forbidden')
    }

    const em = await User.findOne({ _id: accepterId })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist' })

    const guest = await User.findOne({ _id: userId })
    if (!guest)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist' })

    const connection = await Connection.findOne({ _id: connectionId })

    if (!connection) {
      return res
        .status(404)
        .send({ success: false, message: 'Connection request does not exist' })
    }

    await Connection.findByIdAndUpdate(
      connectionId,
      {
        $set: { status: 'accepted' }
      },
      { new: true }
    )

    await new Alert({
      type: 'connection',
      message: `Your request to connect to ${em?.bio?.firstname} ${em?.bio?.lastname} was accepted`,
      user: userId
    }).save()

    await new Alert({
      type: 'connection',
      message: `${guest?.bio?.firstname} ${guest?.bio?.lastname} is now a connection`,
      user: em?.id
    }).save()

    await sendConnectionRequestEmailNotice(em, 'Connection was successful', usr)
    await sendConnectionRequestEmailNotice(
      guest,
      'Connection Request Accepted',
      em
    )

    global.io.emit('connection-accepted', {
      acceptedBy: em,
      user: guest,
      message: `Connection request by ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${eguestm?.bio?.lastname} was accepted`
    })

    return res
      .status(200)
      .send({ message: 'Successfully added a new connection' })
  } catch (error) {
    console.log('COOEN : ERRO', error)
    res.status(500).send(error)
  }
}

export async function declineConnectionRequest (req, res) {
  try {
    const { requesterId, userId } = req.body

    if (!req.decoded) {
      throw new Error('You are forbidden')
    }

    const em = await User.findOne({ _id: requesterId })
    const usr = await User.findOne({ _id: userId })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist' })

    if (!usr)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist' })

    await new Alert({
      type: 'connection',
      message: `You declined ${em?.bio?.firstname} ${em?.bio?.lastname}'s connection request`,
      user: userId
    }).save()

    return res.status(200).send({ message: 'Connection request declined' })
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}
