const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: [true, "username already taken"],
        required: true,
    }, 

    email:{
        type: String,
        unique:[true, "Account already exists with this email address"],
        required: true,
    },

    password:{  // No, password should NOT be unique, because Many users can coincidentally have the same password, so enforcing "unique" is unnecessary and can cause registration errors. Also, passwords are stored as hashed values, and uniqueness on hashes adds no real security benefit. Instead, ensure email/username is unique, not the password.
        type: String,
        required: true
    }
})

//creating a userModel
const userModel = mongoose.model("users", userSchema)  // Inside mongoose package there exists a function/method which tells that user's data is stored in which collection. So, here "users"-> collection name, userSchema->Schema name

module.exports = userModel