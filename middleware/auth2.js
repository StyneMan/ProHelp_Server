const User = require("../model/User.model.js");

exports.encode  = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    const payload = {
      userId: user._id,
      username: user.email,
    };

    const authToken = jwt.sign(
      payload,
      user.authType === "google"
        ? process.env.GOOGLE_AUTH_CLIENT_SECRET ?? "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"
        : process.env.JWT_SECRET ?? '2148286a112343a0c679e483234c01752481398ec876c7137ed5a6be1156d185098c9df6d1610d017d773f8feb8aaaeb5357e436495fdfce5def944a1fb0de3b'
    );

    req.authToken = authToken;

    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: error.error });
  }
};
