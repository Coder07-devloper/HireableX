const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();  
app.use(express.json()) // middleware that allows to read the data inside the req.body.
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// require all the routes here
const authRouter = require("./routes/authRoutes")
const interviewRouter = require("./routes/interviewRoutes")

// using all the routes here
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)



module.exports = app   // exporting the app. '

// NOTE - this app.js file has mainly two functions only: - (i) initiating a server i.e creattignan instance of the server. (ii)using the middlewares and routes that we have created in this project here.

