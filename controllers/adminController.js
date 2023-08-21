import Admin from "../model/Admin.model.js";
import Legal from "../model/Legal.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import ENV from "../config.js";
import otpGenerator from "otp-generator";
import { sendVerificationCode } from "./mailer.js";
// import admin from "firebase-admin";
// import serviceAccount from "../middleware/serviceAccKey.json";
import express from "express";

let customErr = new Error();

export async function register(req, res) {
  try {
    const { password, email, bio, device, privilege } = req.body;

    const em = await Admin.findOne({ email }); // check if a admin with the same email exists in the database

    if (em)
      return res.status(400).json({
        success: false,
        message: "The email is already associated to an account.",
      });

    if (password) {
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const admin = new Admin({
            password: hashedPassword,
            email,
            device,
            bio,
            privilege,
          });

          // return save result as a response
          admin
            .save()
            .then(async (result) => {
              //Now send email here
              res.status(200).send({
                success: true,
                message: "Admin account created successfully. ",
                data: result,
              });
            })
            .catch((error) =>
              res.status(500).send({ success: false, message: error })
            );
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
}

export async function login(req, res) {
  const { email, password } = req.body;
  console.log("PAYLOADS", req.body);
  try {
    Admin.findOne({ email })
      .then((admin) => {
        bcrypt
          .compare(password, admin.password)
          .then((passwordCheck) => {
            if (!passwordCheck)
              return res.status(400).send({
                success: false,
                message: "Incorrect credentials. Try again.",
              });

            // create jwt token
            const token = jwt.sign(
              {
                userId: admin._id,
                username: admin.email,
              },
              process.env.JWT_SECRET,
              { expiresIn: "24h" }
            );

            const { password, ...rest } = Object.assign({}, admin.toJSON());

            return res.status(200).send({
              message: "You have successfully logged in",
              success: true,
              token,
              data: rest,
            });
          })
          .catch((error) => {
            return res.status(400).send({
              success: false,
              message: "Incorrect user credentials. Try again.",
            });
          });
      })
      .catch((error) => {
        return res.status(404).send({
          success: false,
          message: "Account does not exist. Try again",
        });
      });
  } catch (error) {
    return res.status(500).send({ error });
  }
}

export async function logout(req, res) {
  // if (app.locals.resetSession) {
  app.locals.resetSession = false; // reset session
  return res
    .status(200)
    .send({ success: true, message: "Logged out successfully" });
  // }
  // return res
  // 	.status(403)
  // 	.send({ success: false, message: "Session expired!" });
}

export async function getAdmins(req, res, next) {
  const { email } = req.params;
  try {
    if (!email)
      return res
        .status(500)
        .send({ success: false, message: "Account does not exist" });

    const finder = await Admin.find({ email: { $ne: email } });

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
}

export async function profile(req, res) {
  try {
    // console.log("LOGGER ", req);
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No user found!";
      customErr.code = 404;
      throw customErr;
    }

    const { password, ...rest } = Object.assign({}, admin.toJSON());

    res.send(rest);

    //populate data
  } catch (error) {
    res.status(error?.code || 500).send({
      message: error?.message || "Some error occurred while retrieving data.",
    });
  }
}

export async function setPrivacyPolicy(req, res) {
  try {
    let { privacy, id } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    if (!id) {
      console.log("DHN", privacy);
      const lega = new Legal({
        privacy: privacy,
        terms: "",
        cookies: "",
      });

      lega
        .save()
        .then(async (result) => {
          res.status(200).send({
            success: true,
            message: "Privacy policy set successfully",
            data: result,
          });
        })
        .catch((error) => {
          console.log("ERZX", error);
          res.status(500).send({ success: false, message: error });
        });
    } else {
      const legal = await Legal.findById({ _id: id });

      if (!legal) {
        //Create new here
        const lega = new Legal({
          privacy: privacy,
          terms: "",
          cookies: "",
        });

        lega
          .save()
          .then(async (result) => {
            res.status(200).send({
              success: true,
              message: "Privacy policy set successfully",
              data: result,
            });
          })
          .catch((error) =>
            res.status(500).send({ success: false, message: error })
          );
      } else {
        let updateLegal = await Legal.findByIdAndUpdate(
          id,
          {
            $set: {
              privacy: privacy,
            },
          },
          { new: true }
        );

        return res.status(200).send({
          success: true,
          message: "Privacy policy set successfully",
          data: updateLegal,
        });
      }
    }
  } catch (error) {
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

export async function setCookiePolicy() {}

export async function setTermsOfUse(req, res) {
  try {
    let { terms, id } = req.body;
    if (!req.decoded) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const admin = await Admin.findOne({ email: req.decoded.username });

    if (!admin) {
      customErr.message = "No admin found!";
      customErr.code = 404;
      throw customErr;
    }

    if (!id) {
      const lega = new Legal({
        privacy: "",
        terms: terms,
        cookies: "",
      });

      lega
        .save()
        .then(async (result) => {
          res.status(200).send({
            success: true,
            message: "Terms of service set successfully",
            data: result,
          });
        })
        .catch((error) => {
          console.log("ERZX", error);
          res.status(500).send({ success: false, message: error });
        });
    } else {
      const legal = await Legal.findById({ _id: id });

      if (!legal) {
        //Create new here
        const lega = new Legal({
          privacy: "",
          terms: terms,
          cookies: "",
        });

        lega
          .save()
          .then(async (result) => {
            res.status(200).send({
              success: true,
              message: "Terms of service set successfully",
              data: result,
            });
          })
          .catch((error) =>
            res.status(500).send({ success: false, message: error })
          );
      } else {
        let updateLegal = await Legal.findByIdAndUpdate(
          id,
          {
            $set: {
              terms: terms,
            },
          },
          { new: true }
        );

        return res.status(200).send({
          success: true,
          message: "Terms of service updated successfully",
          data: updateLegal,
        });
      }
    }
  } catch (error) {
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

