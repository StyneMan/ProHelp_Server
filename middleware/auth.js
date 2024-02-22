import jwt from "jsonwebtoken";
import express from "express";
import User from "../model/User.model.js";

const app = express();

/** auth middleware */
export default async function Auth(req, res, next) {
  try {
    const { email: paramEmail } = req.params;
    // access authorize header to validate request
    const token = req.headers.authorization.split(" ")[1];


    const usr = await User.findOne({ email: paramEmail });

    // console.log("USERE HERE ;;:: ", token);

    if (!usr) {
      return res
        .status(401)
        .json({ success: false, message: "You are not a registered user!" });
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "You are not authorized!" });
    }

    // Use a consistent secret for signing and verifying tokens
    const secret =
      usr?.authType === "google"
        ? process.env.GOOGLE_AUTH_CLIENT_SECRET
        : process.env.JWT_SECRET;

        // console.log("UNDECODED TOKEN :: ", token);
        
    // Verify the token
    const decodedToken = jwt.verify(token, secret);

    // console.log("DECODED TOKEN :: ", decodedToken);

    // Now use the email to retrieve the user
    const { username } = decodedToken;

    const user = await User.findOne({ email: username });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "You are not a registered user!" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("AUTH ERROR :: ", error);
    res.status(500).json({ success: false, message: error });
  }
}

export function localVariables(req, res, next) {
  app.locals = {
    otp: null,
    resetSession: false,
  };
  next();
}

export function verifyCookie(req, res, next) {
  //check accesspro api key first process.env.ACCESSPRO_API_KEY
  const token = req.headers["authorization"]?.split(" ")[1];
  // console.log('REQ CHECK EHERE :::', req)

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        // console.log('token err: ', err)
        return res.status(401).send({
          message: "Unauthorized access.",
        });
      }
      req.decoded = decoded;
      // console.log('decoded', decoded)
      next();
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      message: "No token provided.",
    });
  }
}

export function verifyAdmin(req, res, next) {
  const secret = req.headers["secret-key"];
  // verifies secret
  if (secret && secret === process.env.APP_SECRET) {
    next();
  } else {
    // return an error
    return res.status(403).send({
      message: "You are forbidden from this application!",
    });
  }
}
