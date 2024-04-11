import Support from '../model/Support.model.js'
import { v4 } from 'uuid'
import { sendConnectionRequestEmailNotice, sendSupportEmail } from './mailer.js'
import User from '../model/User.model.js'
import Alert from '../model/Alert.model.js'
import Connection from '../model/Connection.model.js'
import Transaction from '../model/Transaction.model.js'
// import { pusher } from '../utils/pusher.js'

const population = {
  path: 'user',
  select: '-password' // Exclude the password field
}

const population2 = [
  {
    path: 'user',
    select: '-password' // Exclude the password field
  },
  {
    path: 'guest',
    select: '-password' // Exclude the password field
  }
]

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

            // pusher.trigger('connection', 'connection-requested', {
            //   requestBy: em,
            //   user: guestUser,
            //   message: `${em?.bio?.firstname} ${em?.bio?.middlename} ${em?.bio?.lastname} requested to connect`
            // })

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

    const em = await User.findOne({ id: accepterId })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist!! ACC' })

    const guest = await User.findOne({ _id: userId })
    if (!guest)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist ACCEPT' })

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

    await User.findByIdAndUpdate(
      accepterId,
      {
        $pull: { pendingReceivedConnect: userId }
      },
      { new: true }
    )

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { pendingSentConnect: accepterId }
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

    await sendConnectionRequestEmailNotice(
      em,
      'Connection was successful',
      guest
    )
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

    // pusher.trigger('connection', 'connection-accepted', {
    //   acceptedBy: em,
    //   user: guest,
    //   message: `Connection request by ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${eguestm?.bio?.lastname} was accepted`
    // })

    return res
      .status(200)
      .send({ message: 'Successfully added a new connection' })
  } catch (error) {
    console.log('COOEN : ERRO', error)
    return res.status(500).send({ success: false, message: error?.message })
  }
}

export async function declineConnectionRequest (req, res) {
  try {
    const { accepterId, userId } = req.body
    const { connectionId } = req.params

    console.log('BODY :: ', req.body)
    console.log('PARAMS :: ', req.params)

    const em = await User.findOne({ id: accepterId })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist!' })

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
        $set: { status: 'rejected' }
      },
      { new: true }
    )

    await User.findByIdAndUpdate(
      accepterId,
      {
        $pull: { pendingReceivedConnect: userId }
      },
      { new: true }
    )

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { pendingSentConnect: accepterId }
      },
      { new: true }
    )

    await new Alert({
      type: 'connection',
      message: `${guest?.bio?.firstname} ${guest?.bio?.lastname} connection request declined`,
      user: em?.id
    }).save()

    global.io.emit('connection-declined', {
      declinedBy: em,
      user: guest,
      message: `Connection request by ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${guest?.bio?.lastname} was accepted`
    })

    // pusher.trigger('connection', 'connection-declined', {
    //   declinedBy: em,
    //   user: guest,
    //   message: `Connection request by ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${guest?.bio?.lastname} was accepted`
    // })


    return res
      .status(200)
      .send({ message: 'Successfully declined connection request' })
  } catch (error) {
    console.log('COOEN : ERRO', error)
    return res.status(500).send({ success: false, message: error?.message })
  }
}

export async function disconnectConnection (req, res) {
  try {
    const { userId } = req.body
    const { connectionId, email } = req.params

    console.log('BODY :: ', req.body)
    console.log('PARAMS :: ', req.params)

    const em = await User.findOne({ email })
    if (!em)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist!' })

    const guest = await User.findOne({ id: userId })
    if (!guest)
      return res
        .status(404)
        .send({ success: false, message: 'User account does not exist' })

    const connection = await Connection.findOne({ _id: connectionId })

    if (!connection) {
      return res
        .status(404)
        .send({ success: false, message: 'Connection does not exist' })
    }

    await Connection.findByIdAndUpdate(
      connectionId,
      {
        $set: { status: 'disconnected' }
      },
      { new: true }
    )

    await new Alert({
      type: 'connection',
      message: `You disconnected from ${guest?.bio?.firstname} ${guest?.bio?.lastname}`,
      user: em?.id
    }).save()

    global.io.emit('connection-disconnected', {
      disconnectedBy: em,
      user: guest,
      message: `Connection disconnected ${em?.bio?.firstname} ${em?.bio?.middlename} ${em?.bio?.lastname} was accepted`
    })

    // pusher.trigger('connection', 'connection-disconnected', {
    //   disconnectedBy: em,
    //   user: guest,
    //   message: `Connection disconnected ${em?.bio?.firstname} ${em?.bio?.middlename} ${em?.bio?.lastname} was accepted`
    // })

    return res
      .status(200)
      .send({
        message: `Successfully disconnected from ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${guest?.bio?.lastname} `
      })
  } catch (error) {
    console.log('COOEN : ERRO', error)
    return res.status(500).send({ success: false, message: error?.message })
  }
}

export async function cancelConnectionRequest (req, res) {
  try {
    const { requesterId, userId } = req.body
    const { connectionId } = req.params

    const em = await User.findOne({ _id: requesterId })
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
        $set: { status: 'cancelled' }
      },
      { new: true }
    )

    await User.findByIdAndUpdate(
      guest?.id,
      {
        $pull: {
          pendingReceivedConnect: requesterId
        }
      },
      { new: true }
    )

    const usr = await User.findByIdAndUpdate(
      em?.id,
      {
        $pull: {
          pendingSentConnect: userId
        }
      },
      { new: true }
    )

    await new Alert({
      type: 'connection',
      message: `Connection request to ${guest?.bio?.firstname} ${guest?.bio?.lastname} has been cancelled successfully`,
      user: em?.id
    }).save()

    global.io.emit('connection-cancelled', {
      cancedBy: em,
      user: guest,
      message: `Connection request by ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${eguestm?.bio?.lastname}  was cancelled`
    })

    // pusher.trigger('connection', 'connection-cancelled', {
    //   cancedBy: em,
    //   user: guest,
    //   message: `Connection request by ${guest?.bio?.firstname} ${guest?.bio?.middlename} ${eguestm?.bio?.lastname}  was cancelled`
    // })

    return res
      .status(200)
      .send({ message: 'Successfully added a new connection', data: usr })
  } catch (error) {
    console.log('COOEN : ERRO', error)
    return res.status(500).send({ success: false, message: error?.message })
  }
}

export async function getUserConnections (req, res) {
  try {
    const { email } = req.params
    let query
    const { page = 1, limit = 25 } = req.query

    console.log('USER  ::: ', req.user)

    query = {
      $and: [
        { status: 'accepted' },
        { $or: [{ user: req.user?._id }, { guest: req.user?._id }] }
      ]
    }

    const options = {
      sort: { createdAt: -1 },
      populate: population2,
      page,
      limit
    }

    const connections = await Connection.paginate(query, options)
    return res.status(200).send(connections)
  } catch (error) {
    console.log('ERROR', error)
    res.status(500).send({
      success: false,
      message: error?.message
    })
  }
}

export async function getUserPastConnections (req, res) {
  try {
    const { email } = req.params
    let query
    const { page = 1, limit = 25 } = req.query

    console.log('USER  ::: ', req.user)

    query = {
      $and: [
        { status: 'disconnected' },
        { $or: [{ user: req.user?._id }, { guest: req.user?._id }] }
      ]
    }

    const options = {
      sort: { createdAt: -1 },
      populate: population2,
      page,
      limit
    }

    const connections = await Connection.paginate(query, options)
    res.status(200).send(connections)
  } catch (error) {
    console.log('ERROR', error)
    res.status(500).send({
      success: false,
      message: error?.message
    })
  }
}

export async function getUserPendingConnectionRequest (req, res) {
  try {
    const { email } = req.params
    let query
    const { page = 1, limit = 30 } = req.query

    console.log('USER  ::: ', req.user)

    query = {
      $and: [{ guest: req.user?._id }, { status: 'pending' }]
    }

    const options = {
      sort: { createdAt: -1 },
      populate: population2,
      page,
      limit
    }

    const connections = await Connection.paginate(query, options)
    console.log('CONECTIONS :: ', connections)
    return res.status(200).send(connections)
  } catch (error) {
    console.log('ERROR', error)
    return res.status(500).send({
      success: false,
      message: error?.message
    })
  }
}
