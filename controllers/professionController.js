// import { errorMonitor } from "nodemailer/lib/xoauth2"; 
import Profession from "../model/Profession.model.js";

let customErr = new Error();

export async function addProfession(req, res) {
  try {
    if (!req.decoded) {
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const profession = await new Profession({ ...req.body });

    profession
      .save()
      .then((result) => {
        return res.status(200).send({
          sucess: true,
          message: "New profession added successfully!",
        });
      })
      .catch((err) => {
        console.log("ADD PRofession Error =>", err);
        customErr.message = "An error occurred!";
        customErr.code = 400;
        throw customErr;
      });
  } catch (error) {
    console.log("ADD PRofession Error =>", error);
    res.status(500).send({ sucess: false, message: error });
  }
}

export async function allProfession(req, res) {
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

    const professions = await Profession.paginate(query, options);

    res.status(200).send(professions);
  } catch (error) {
    customErr.message = "An error occurred";
    customErr.code = 500;
    throw customErr;
  }
}

export async function deleteProfession(req, res) {
  try {
    if (!req.decoded) {
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const { id } = req.query;
    const profession = Profession.findOne({ _id: id });

    if (!profession) {
      return res
        .status(404)
        .send({ success: false, message: "Profession not found." });
    }
    const profe = await Profession.findByIdAndDelete(id);

    return res.status(200).send({
      success: true,
      message: "Successfully deleted profession",
      data: profe,
    });
  } catch (error) {
    console.log("DELET ERR PROFESSION", error);
    customErr.message = "An error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}

export async function updateProfession(req, res) {
  try {
    const payload = req.body;
    const { id } = req.query;

    if (!req.decoded) {
      customErr.message = "You are forbidden!";
      customErr.code = 403;
      throw customErr;
    }

    const profession = Profession.findOne({ _id: jobId });

    if (!profession) {
      return res
        .status(404)
        .send({ success: false, message: "Profession not found." });
    }

    let profess = await Profession.findByIdAndUpdate(
      id,
      {
        $set: payload,
      },
      { new: true }
    );
    return res.status(200).send({
      success: false,
      message: "Successfully updated profession",
      data: profess,
    });
  } catch (error) {
    customErr.message = "An unexpected error occurred!";
    customErr.code = 500;
    throw customErr;
  }
}
