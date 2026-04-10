const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blacklistModel")

async function authUser(req, res, next){

    const token = req.cookies.token //reading the token

    // if we don't get any token 
    if(!token){
        return res.status(401).json({
            message : "token not provided"
        })
    }

    // checking if token is blacklisted or not
    const isTokenBlacklisted = await tokenBlackListModel.findOne({token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message : "Token is invalid"
        })
    }

    try{
         const decoded = jwt.verify(token, process.env.JWT_SECRET)

         // if we get the data then we'll set that data
         req.user = decoded  // all the data that we're getting after verifying/reading token are stored inside "decoded", and then this data is set to a new property inside request which is "user" which didn't existed earlier, then this  from request is passed to the controller 
         next()
    }catch(err){
        res.status(401).json({
            message : "Invalid token"
        })
    }
   
}

module.exports = {authUser}
