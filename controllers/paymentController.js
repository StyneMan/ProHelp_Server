import { v4 } from "uuid";
import {
  sendConnectionRequestEmailNotice,
  sendSupportEmail,
} from "./mailer.js";
import User from "../model/User.model.js";
import Alert from "../model/Alert.model.js";
import Transaction from "../model/Transaction.model.js";
import Admin from "../model/Admin.model.js";
import axios from "axios";

const population = {
  path: "user",
  select: "-password", // Exclude the password field
};

export async function initPayment(req, res) {
  try {
    // let { terms,  } = req.body;
    if (!req.params?.email) {
      //forbidden
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const user = await User.findOne({ email: req.params?.email });

    if (!user) {
      customErr.message = "No user found!";
      customErr.code = 404;
      throw customErr;
    }

    //  Now make a trip to flutterwave endpoint via axios
    const payload = req.body;

    const resp = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${"FLWSECK_TEST-4e96610a3ea8b485f1ddc2bda8459acc-X"}`,
        },
      }
    );

    // Create transaction here
    await new Transaction({
      user: user?.id ?? user?._id,
      type: req.params?.transactionType,
      reference: req.body?.tx_ref,
      amount: req.body?.amount,
      summary: `${req.params?.transactionType} transaction`,
      status: resp?.data?.status,
    }).save();

    // Create alert here
    await new Alert({
      user: user?.id ?? user?._id,
      type: `${req.params?.transactionType}`.includes("wallet")
        ? "wallet"
        : `${req.params?.transactionType}`.includes("job")
        ? "job"
        : "connection",
      message: `${req.params?.transactionType} transaction`,
      status: resp?.data?.status,
    }).save();

    res.status(200).send({ ...resp.data });
  } catch (error) {
    console.log("ERRO ", error);
    customErr.message = error?.message || "An error occurred!";
    customErr.code = 500;
    throw customErr;
    // res.status(500).send(error)
  }
}

export async function verifyPayment(req, res) { 
    try {
        console.log("QUERY PARAMS ::: ", req.query);
    } catch (error) {
        console.log(error);
    }
}


export async function paymentWebHook(req, res) {
    try {
        console.log("WEBHOOK RSP :: ", req.data);
    } catch (error) {
        console.log(error);
    }
}