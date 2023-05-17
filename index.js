const express = require('express');
const dotenv = require('dotenv');
const db = require('./db')
const generateOTPRoute=require("./Routes/otpRoute")
const loginRoute=require("./Routes/userRoute")

const app = express();
app.use(express.json())
dotenv.config();


app.get("/", (req, res)=>{
    res.send("Server is running... ")
})

app.use('/generate-otp', generateOTPRoute);
app.use('/login', loginRoute);

const port = process.env.PORT || 4000;


app.listen(port, () => {
    console.log("Server is running on port 8080");
})