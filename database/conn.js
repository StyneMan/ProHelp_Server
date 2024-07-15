const mongoose = require("mongoose");

async function connect(){

    // const mongod = await MongoMemoryServer.create();
    // const getUri = mongod.getUri();

    mongoose.set('strictQuery', true)
    // const db = await mongoose.connect(getUri);
    const db = await mongoose.connect(process.env.ATLAS_URI ?? 'mongodb+srv://infoprohelpng:qwerty12@phcluster.mg6duzf.mongodb.net/prohelp_db');
    console.log("Database Connected")
    return db;
}

module.exports = connect;