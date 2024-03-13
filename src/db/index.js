const mongoose = require('mongoose')
const { DB_NAME } = require("../constants.js");
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n Mongodb connected DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MOngoDB connect error ", error);
        process.exit(1);
    }
}

module.exports = connectDB;