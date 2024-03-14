require('dotenv').config()

// import dotenv from 'dotenv'
const connectDB = require('./db/index');

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("mongodb failed !!! ", err);
    })
