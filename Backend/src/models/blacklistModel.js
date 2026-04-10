// This file is created for doing the token blacklisting.
const mongoose = require("mongoose")

const blacklistTokenSchema = new mongoose.Schema({
    token:{
        type: String,
        required:[true, "token is required to be added in"]
    }
},{
    timestamps:true  // database itself manages the timestamps of when the token was blacklisted 
})


const tokenBlackListModel = mongoose.model("blacklistToken", blacklistTokenSchema)

module.exports = tokenBlackListModel