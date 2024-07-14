const User = require("../model/User.model.js");
const OTP = require("../model/OTP.model.js");
const Alert = require("../model/Alert.model.js");
const Gurantor = require("../model/Gurantor.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// import ENV from "../config.js";
const otpGenerator = require("otp-generator");
const { sendVerificationCode } = require("./mailer.js");
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const appleSignin = require("apple-signin-auth");

const app = express();

const clientAndroid = new OAuth2Client(
  process.env.GOOGLE_AUTH_CLIENT_ID_ANDROID ??
    "964741321159-c0hcfbf27c9v5mub4vadpau1o5rerqqe.apps.googleusercontent.com"
);

// const clientWeb = new OAuth2Client(
//   process.env.GOOGLE_AUTH_CLIENT_ID_WEB
// );

/** middleware for verify user */
exports.verifyUser = async (req, res, next) => {
  try {
    const { email } = req.method == "GET" ? req.query : req.body;

    // check the user existance
    let exist = await User.findOne({ email });
    if (!exist)
      return res
        .status(404)
        .send({ success: false, message: "Can not find user!" });
    next();
  } catch (error) {
    console.log("MERROR ", error);
    return res
      .status(404)
      .send({ success: false, message: "Authentication error" });
  }
};

/** POST: http://localhost:8080/api/register 
 * @param : {
  "password" : "admin123",
  "email": "example@gmail.com",
}
*/
exports.signup = async (req, res) => {
  try {
    const { password, email, source } = req.body;

    const em = await User.findOne({ email }); // check if a user with the same email exists in the database

    if (em)
      return res.status(400).json({
        success: false,
        message: "The email is already associated to an account.",
      });

    if (password) {
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          if (source === "web") {
            const user = new User({
              password: hashedPassword,
              email,
              accountType: req.body?.accountType,
              profession: req.body?.profession,
              bio: {
                gender: req.body?.gender,
                firstname: req.body?.firstname,
                lastname: req.body?.lastname,
                middlename: req.body?.middlename,
                phone: req.body?.phone,
              },
            });

            // return save result as a response
            user
              .save()
              .then(async (result) => {
                //Now send email here
                let code = generateOTP();
                sendVerificationCode(
                  email,
                  code,
                  result.bio.firstname,
                  "register"
                )
                  .then(async (val) => {
                    try {
                      //Now save the otp code here
                      app.locals.otp = code;
                      const otp = await OTP.findOne({ user: result?.id });

                      if (otp) {
                        //Override OTP code

                        await OTP.findOneAndUpdate(
                          otp?._id,
                          {
                            $set: {
                              code: code,
                            },
                          },
                          { new: true }
                        );
                      } else {
                        await new OTP({
                          user: result?.id,
                          emailAddress: email,
                          code,
                        }).save();
                      }

                      //Save for uauth type
                      app.locals.authType = "normal";

                      await new Alert({
                        type: "auth",
                        message: "New account registration notification",
                        user: result?.id ?? result?._id,
                      }).save();

                      return res.status(200).send({
                        success: true,
                        message: "An OTP code has been sent to your email. ",
                      });
                    } catch (error) {
                      console.log(error);
                      res.status(400).send({ success: false, message: err });
                    }
                  })
                  .catch((err) => {
                    res.status(500).send({ success: false, message: err });
                  });
              })
              .catch((error) =>
                res.status(500).send({ success: false, message: error })
              );
          } else {
            // App
            const user = new User({
              password: hashedPassword,
              email,
              accountType: req.body?.accountType,
            });

            user
              .save()
              .then(async (result) => {
                //Now send email here
                let code = generateOTP();
                sendVerificationCode(
                  email,
                  code,
                  result.bio.firstname,
                  "register"
                )
                  .then(async (val) => {
                    res.status(200).send({
                      success: true,
                      message: "An OTP code has been sent to your email. ",
                    });
                    //Now save the otp code here
                    const otp = await OTP.findOne({ user: user?.id });

                    if (otp) {
                      const updated = await OTP.findOneAndUpdate(
                        otp?._id,
                        {
                          $set: {
                            code: code,
                          },
                        },
                        { new: true }
                      );
                    } else {
                      const addOTP = await new OTP({
                        user: user?.id,
                        emailAddress: email,
                        code,
                      }).save();
                    }

                    app.locals.otp = code;
                    //Save for uauth type
                    app.locals.authType = "normal";

                    await new Alert({
                      type: "auth",
                      message: "New account registration notification",
                      user: result?.id ?? result?._id,
                    }).save();
                  })
                  .catch((err) => {
                    res.status(500).send({ success: false, message: err });
                  });
              })
              .catch((error) =>
                res.status(500).send({ success: false, message: error })
              );
          }
        })
        .catch((error) => {
          return res.status(500).send({
            success: false,
            message: error,
          });
        });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const em = await User.findOne({ email }); // check if a user with the same email exists in the database

    if (!em)
      return res.status(400).json({
        success: false,
        message: "Email is not registered on this platform.",
      });
    let code = await generateOTP();
    sendVerificationCode(email, code).then((val) => {
      res.status(200).send({
        success: true,
        message: "An OTP code has been sent to your email. ",
      });
      //Now save the otp code here
      app.locals.otp = code;
    });
  } catch (error) {
    console.log("FORGOT-ERROR:: ", error);
    res.status(500).send({
      success: false,
      message: "An error occurred ",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            success: false,
            message: "User account does not exist",
          });
        }

        bcrypt
          .compare(password, user.password)
          .then(async (passwordCheck) => {
            try {
              if (!passwordCheck)
                return res.status(400).send({
                  success: false,
                  message: "Incorrect user credentials. Try again.",
                });

              // create jwt token
              const token = jwt.sign(
                {
                  userId: user._id,
                  username: user.email,
                },
                process.env.JWT_SECRET ??
                  "2148286a112343a0c679e483234c01752481398ec876c7137ed5a6be1156d185098c9df6d1610d017d773f8feb8aaaeb5357e436495fdfce5def944a1fb0de3b",
                { expiresIn: "48h" }
              );

              app.locals.authType = "normal";

              const { password, ...rest } = Object.assign({}, user.toJSON());

              const alert = new Alert({
                type: "auth",
                message: "Account login notification",
                user: user?.id ?? user?._id,
              });
              await alert.save();

              return res.status(200).send({
                message: "You have successfully logged in",
                success: true,
                token,
                data: rest,
              });
            } catch (error) {
              return res.status(400).send({
                success: false,
                message: error,
              });
            }
          })
          .catch((error) => {
            return res.status(400).send({
              success: false,
              message: "Incorrect user credentials. Try again.",
            });
          });
      })
      .catch((error) => {
        console.log("ERRO  ", error);
        return res.status(404).send({
          success: false,
          message: "User account does not exist",
        });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

exports.logout = async (req, res) => {
  app.locals.resetSession = false; // reset session
  return res
    .status(200)
    .send({ success: true, message: "Logged out successfully" });
};

exports.getUser = async (req, res) => {
  const { email } = req.params;

  try {
    if (!email)
      return res
        .status(404)
        .send({ success: false, message: "Invalid Username" });

    User.findOne({ email })
      .then((val) => {
        // if (!val)
        // 	return res.status(501).send({
        // 		success: false,
        // 		message: "Couldn't Find the User",
        // 	});
        /** remove password from user */
        // mongoose return unnecessary data with object so convert it into json
        const { password, ...rest } = Object.assign({}, val.toJSON());

        return res.status(200).send({
          success: true,
          message: "Operation successful",
          data: rest,
        });
      })
      .catch((error) => {
        console.log("ERROR GETTING USER:: >> ", error);
        return res
          .status(404)
          .send({ success: false, message: "Cannot Find User Data" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: "Cannot Find User Data" });
  }
};

exports.getAllUsers = async (req, res, next) => {
  const { email } = req.params;
  try {
    if (!email)
      return res
        .status(500)
        .send({ success: false, message: "User does not exist" });

    const finder = await User.find({ email: { $ne: email } });

    let emptArr = [];

    finder.forEach((element) => {
      const { password, ...rest } = Object.assign({}, element.toJSON());
      emptArr.push(rest);
    });

    res
      .status(200)
      .send({ success: true, message: "Operation successful", data: emptArr });
  } catch (error) {
    console.log("ERROR OCCURED >. ", error);
    return res.status(404).send({ error: "Cannot Find User Data" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { email } = req.params;

    if (email) {
      const body = req.body;

      let usr = await User.findOneAndUpdate({ email: email }, body, {
        new: true,
      });

      // if (body.guarantor) {
      //   // Add guarantor here
      //   let added = await Gurantor.findOne({ user: usr?.id });
      //   if (added) {
      //     await Gurantor.findOneAndUpdate({ email: email }, {...body?.guarantor, user: usr?.id,}, {
      //       new: true,
      //     });
      //   }
      //   else {
      //     await new Gurantor({
      //       user: usr?.id,
      //       ...body?.guarantor
      //     }).save();
      //   }
      // }

      /** remove password from user */
      // mongoose return unnecessary data with object so convert it into json
      const { password, ...rest } = Object.assign({}, usr.toJSON());

      await new Alert({
        type: "profile",
        message: "Your profile was updated ",
        user: usr?.id ?? usr?._id,
      }).save();

      res.status(200).send({
        success: true,
        message: "Profile updated successfully!",
        data: rest,
      });
    } else {
      return res
        .status(404)
        .send({ success: false, message: "User does not exist!" });
    }
  } catch (error) {
    return res.status(500).send({ error });
  }
};

function generateOTP() {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
}

exports.resendOTP = async (req, res) => {
  try {
    const { email, type } = req.query;
    const user = await User.findOne({ email });
    app.locals.otp = null;
    let code = generateOTP();
    sendVerificationCode(
      email,
      code,
      "",
      type === "register" ? "register" : "password"
    ).then(async (val) => {
      res.status(200).send({
        success: true,
        message: "An OTP code has been sent to your email. ",
      });
      //Now save the otp code here
      const otp = await OTP.findOne({ user: user?.id });

      if (otp) {
        // Update OTP code
        await OTP.findOneAndUpdate(
          otp?._id,
          {
            $set: {
              code: code,
            },
          },
          { new: true }
        );
      } else {
        await new OTP({
          user: user?.id,
          emailAddress: email,
          code,
        }).save();
      }
      app.locals.otp = code;
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Failed to resend code. Check your network",
    });
    console.log("ERROR", error);
  }
};

exports.verifyOTP = async (req, res) => {
  const { code, email } = req.query;
  try {
    const user = await User.findOne({ email });

    // console.log("USERS ::", user);
    const otp = await OTP.findOne({ user: user?.id.toString() });

    // console.log();('OTPDD ', otp);

    if (!otp) {
      return res
        .status(404)
        .send({ success: false, message: "Code not found!" });
    }

    console.log("DB OTP CODE ", otp?.code);

    if (otp?.code === code) {
      app.locals.otp = null; // reset the OTP value
      app.locals.resetSession = true; // start session for reset password

      // Now reset OTP  code here
      await OTP.findOneAndUpdate(
        otp?._id,
        {
          $set: {
            code: "",
          },
        },
        { new: true }
      );

      User.findOneAndUpdate(
        { email: email },
        { $set: { isEmailVerified: true } },
        {
          new: true,
        }
      )
        .then((usr) => {
          const jwtToken = jwt.sign(
            {
              userId: usr._id,
              username: usr.email,
            },
            process.env.JWT_SECRET ??
              "2148286a112343a0c679e483234c01752481398ec876c7137ed5a6be1156d185098c9df6d1610d017d773f8feb8aaaeb5357e436495fdfce5def944a1fb0de3b",
            { expiresIn: "48h" }
          );

          // const { password, ...rest } = Object.assign({}, usr.toJSON());

          res.status(200).send({
            message: "Account verification successful!",
            success: true,
            token: jwtToken,
          });
        })
        .catch((error) => {
          console.log("ERROR UPDA >> ", `${error}`);
          res
            .status(500)
            .send({ message: "Account verification failed!", success: false });
        });
    } else {
      return res.status(400).send({
        success: false,
        message: "The OTP code you entered is invalid",
      });
    }
    //
  } catch (error) {
    console.log("ERROR VERIFICATION", error);
    return res.status(500).send({ error });
  }
};

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
exports.createResetSession = async (req, res) => {
  if (app.locals.resetSession) {
    return res.status(201).send({ flag: app.locals.resetSession });
  }
  return res.status(403).send({ error: "Session expired!" });
};

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
exports.resetPassword = async (req, res) => {
  try {
    if (!app.locals.resetSession)
      return res
        .status(403)
        .send({ success: false, message: "Session expired!" });

    const { email, password } = req.body;

    try {
      User.findOne({ email })
        .then((user) => {
          bcrypt
            .hash(password, 10)
            .then((hashedPassword) => {
              User.updateOne(
                { password: hashedPassword },
                function (err, data) {
                  if (err) throw err;
                  app.locals.resetSession = false; // reset session
                  return res.status(200).send({
                    success: true,
                    message: "Password updated successfully",
                  });
                }
              );
            })
            .catch((e) => {
              return res.status(500).send({
                error: "Unable to update password",
              });
            });
        })
        .catch((error) => {
          return res.status(404).send({ error: "User does not exist" });
        });
    } catch (error) {
      return res.status(500).send({ error });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
};

exports.getGoogleParams = async (req, res) => {
  try {
    const { token, accountType } = req.body;
    const tic = await clientAndroid
      .verifyIdToken({
        idToken: token,
        // audience: process.env.GOOGLE_AUTH_CLIENT_ID_ANDROID,
      })
      .catch((err) => {});

    app.locals.authType = "google";

    console.log("TOKEN ICK", tic);

    const payload = tic.getPayload();

    console.log("PAYLOAD ", payload);
    console.log("ATTRIBBUTES ", tic.getAttributes());

    const userId = payload?.sub;
    const username = payload?.name;
    let user = await User.findOne({ email: payload?.email });

    if (user) {
      //Already exists so now change status to verified
      User.findOneAndUpdate(
        { email: payload?.email },
        { $set: { isEmailVerified: true } },
        {
          new: true,
        }
      )
        .then(async (usr) => {
          const jwtToken = jwt.sign(
            {
              userId,
              username: payload?.email,
            },
            process.env.GOOGLE_AUTH_CLIENT_SECRET ??
              "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",
            { expiresIn: "24h" }
          );

          const { password, ...rest } = Object.assign({}, usr.toJSON());

          const alert = new Alert({
            type: "auth",
            message: "Google account login",
            user: usr?.id ?? usr?._id,
          });
          await alert.save();

          res.status(200).send({
            message: "User logged in successfully",
            success: true,
            token: jwtToken,
            data: rest,
          });
        })
        .catch((error) => {
          console.log("ERROR UPDA >> ", `${error}`);
          res.status(500).send({ message: "Operation failed", success: false });
        });
    } else {
      //Does not exist, register here
      const user = new User({
        "bio.firstname":
          username.toLowerCase().split(" ")[0] ??
          tic.getAttributes().payload.given_name,
        "bio.lastname":
          username.toLowerCase().split(" ")[1] ??
          tic.getAttributes().payload.family_name,
        "bio.image": tic.getAttributes()?.payload?.picture,
        email: tic.getAttributes().payload.email,
        "bio.phone": `${tic.getAttributes().payload?.phone}`,
        isEmailVerified: true,
        authType: "google",
        password: "google-auth",
      });

      // return save result as a response
      user
        .save()
        .then(async (result) => {
          const jwtToken = jwt.sign(
            {
              userId,
              username,
            },
            process.env.GOOGLE_AUTH_CLIENT_SECRET ??
              "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",
            { expiresIn: "24h" }
          );

          const { password, ...rest } = Object.assign({}, result.toJSON());

          const alert = new Alert({
            type: "auth",
            message: "You registered via Google",
            user: result?.id ?? result?._id,
          });
          await alert.save();

          res.status(200).send({
            message: "Account created successfully",
            success: true,
            token: jwtToken,
            data: rest,
          });
        })
        .catch((error) =>
          res.status(500).send({ success: false, message: error })
        );
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
};

exports.getAppleParams = async (req, res) => {
  try {
    const { token } = req.body;
    const clientID = "com.prohelpng.applelogin.app";
    const clientSecret =
      "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjlVOFlNRzVIN1UifQ.eyJpc3MiOiJGQzgzWDU0NEo1IiwiaWF0IjoxNzIwOTg5NDU1LCJleHAiOjE3MzY1NDE0NTUsImF1ZCI6Imh0dHBzOi8vYXBwbGVpZC5hcHBsZS5jb20iLCJzdWIiOiJjb20ucHJvaGVscG5nLmFwcGxlbG9naW4uYXBwIn0.8ybD4jmLUTHMtSjCV1SiQUo1VP14_FMlBEqi-0jk406tcA4om7zYwHc2Qnq1w8ybYUxMgBsakbN_dQGdy8yA1g";

    const appleUser = await appleSignin.verifyIdToken(token, {
      audience: process.env.APPLE_AUTH_CLIENT_ID ?? clientID,
      nonce: "nonce", // optional
    });

    console.log("Apple User", appleUser);

    const userId = appleUser?.sub;
    const email =
      appleUser?.email || appleUser?.sub + "@privaterelay.appleid.com";
    const username = `${appleUser?.given_name || ""} ${
      appleUser?.family_name || ""
    }`.trim();
    let user = await User.findOne({ email });

    if (user) {
      // Already exists, update status to verified
      user = await User.findOneAndUpdate(
        { email },
        { $set: { isEmailVerified: true } },
        { new: true }
      );

      const jwtToken = jwt.sign(
        { userId, email },
        process.env.APPLE_AUTH_CLIENT_SECRET ?? clientSecret,
        { expiresIn: "24h" }
      );

      const { password, ...rest } = user.toObject();

      const alert = new Alert({
        type: "auth",
        message: "Apple account login",
        user: user._id,
      });
      await alert.save();

      res.status(200).json({
        message: "User logged in successfully",
        success: true,
        token: jwtToken,
        data: rest,
      });
    } else {
      // Does not exist, register new user
      user = new User({
        "bio.firstname": appleUser?.given_name,
        "bio.lastname": appleUser?.family_name,
        "bio.image": appleUser?.picture,
        email: email,
        isEmailVerified: true,
        authType: "apple",
        password: "apple-auth",
      });

      await user.save();

      const jwtToken = jwt.sign(
        { userId, email },
        process.env.APPLE_AUTH_CLIENT_SECRET ?? clientSecret,
        { expiresIn: "24h" }
      );

      const { password, ...rest } = user.toObject();

      const alert = new Alert({
        type: "auth",
        message: "You registered via Apple",
        user: user._id,
      });
      await alert.save();

      res.status(200).json({
        message: "Account created successfully",
        success: true,
        token: jwtToken,
        data: rest,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGoogleParamsWeb = async (req, res) => {
  try {
    const { email, firstname, lastname, name, picture, id, accountType } =
      req.body;

    app.locals.authType = "google";
    const userId = id;
    const username = name;
    let user = await User.findOne({ email: email });

    if (user) {
      //Already exists so now change status to verified
      User.findOneAndUpdate(
        { email: email },
        {
          $set: {
            isEmailVerified: true,
            authType: "google",
            "bio.image": picture,
            accountType: accountType ?? "professional",
          },
        },
        {
          new: true,
        }
      )
        .then(async (usr) => {
          const jwtToken = jwt.sign(
            {
              userId,
              username: email,
            },
            process.env.GOOGLE_AUTH_CLIENT_SECRET ??
              "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",
            { expiresIn: "48h" }
          );

          const { password, ...rest } = Object.assign({}, usr.toJSON());

          const alert = new Alert({
            type: "auth",
            message: "Google account login notification",
            user: usr?.id ?? usr?._id,
          });
          await alert.save();

          res.status(200).send({
            message: "User logged in successfully",
            success: true,
            token: jwtToken,
            data: rest,
          });
        })
        .catch((error) => {
          console.log("ERROR UPDA >> ", `${error}`);
          res.status(500).send({ message: "Operation failed", success: false });
        });
    } else {
      //Does not exist, register here
      const user = new User({
        "bio.firstname": username.toLowerCase().split(" ")[0] ?? firstname,
        "bio.lastname": username.toLowerCase().split(" ")[1] ?? lastname,
        "bio.image": picture,
        email: email,
        isEmailVerified: true,
        authType: "google",
        password: "google-auth",
      });

      // return save result as a response
      user
        .save()
        .then(async (result) => {
          const jwtToken = jwt.sign(
            {
              userId,
              username,
            },
            process.env.GOOGLE_AUTH_CLIENT_SECRET ??
              "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",
            { expiresIn: "24h" }
          );

          const { password, ...rest } = Object.assign({}, result.toJSON());

          const alert = new Alert({
            type: "auth",
            message: "You registered via Google",
            user: result?.id ?? result?._id,
          });
          await alert.save();

          res.status(200).send({
            message: "Account created successfully",
            success: true,
            token: jwtToken,
            data: rest,
          });
        })
        .catch((error) =>
          res.status(500).send({ success: false, message: error })
        );
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error });
  }
};

exports.allUsers = async (req, res) => {
  try {
    let query;
    const { page = 1, range, limit = 25 } = req.query;

    if (range === "recent") {
      query = {
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date()),
        },
      };
    } else {
      query = {};
    }

    const options = {
      sort: { createdAt: -1 },
      page,
      limit,
    };

    const users = await User.paginate(query, options);

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Some error occurred while fetching loan.",
    });
  }
};
