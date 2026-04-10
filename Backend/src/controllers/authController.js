const userModel = require("../models/usermodel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blacklistModel")

/**
 * @description Returns cookie options that work for both local development and deployed HTTPS environments.
 * @param {import("express").Request} req
 * @returns {{ httpOnly: boolean, sameSite: "lax" | "none", secure: boolean, maxAge: number }}
 */
function getCookieOptions(req) {
    const isSecureRequest =
        req.secure ||
        req.headers["x-forwarded-proto"] === "https" ||
        req.headers.origin?.startsWith("https://")

    return {
        httpOnly: true,
        sameSite: isSecureRequest ? "none" : "lax",
        secure: Boolean(isSecureRequest),
        maxAge: 24 * 60 * 60 * 1000
    }
}

//------------------------------------------------------------------------------------------------------//

// Creating a register controller

/**
 * @name - registerUserController
 * @description - register a new user, expects usernam, email, password in the request body
 * @access - public 
 */

async function registerUserController(req, res){
    const {username, email, password} = req.body  // extracting username, email, password from req.body through destructuring.
    if(!username || !email || !password){
        return res.status(400).json({
            message : "Please provide username, email, password"
        })
    }

    //checking if user already exists or not
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username}, {email}]  // here we're defining the conditions that if either username or email exists then return the user. It is not compulsory that a specific combination of username and email must exist.
    })

    if(isUserAlreadyExists){
        return res.status(400).json({
            message : "Account already exists with this email address or username"
        })
    }

    // if user doesn't exists already then we'll have to create a new user and we cannot do that directly, for that we'll have to first hash the password and after we'll be registering th password. For doing this we need some packages, "bcrypt"->(for hashing), "jsonwebtoken"->(for creating jwt tokens) and "cookie-parser"->(for setting the token into cookie, and reading the token from the cookie) by using "npm i bcryptjs jsonwebtoken cookie-parser"

    // hashing the password
    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password : hash
    })

    // creating jwt token(by using jwt secret key)
    const token = jwt.sign(
        { id: user._id, username: user.username }, // id & username wil be present inside the token
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    //setting this token into cookie
    res.cookie("token", token, getCookieOptions(req))

    res.status(201).json({  // "201" code is used generally when we're creating a new resource and here in backend's language user is also a resource 
        message: "User created successfully",
        user: {
            id : user.id,
            username: user.username,
            email: user.email
        }
    })
}

//------------------------------------------------------------------------------------------------------//

// Creating a login controller 

/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access public
 */

async function loginUserController(req, res){

    const {email, password} = req.body // extracting email and password from the request body through deconstructing.

    // firstly we'll have to check whether a user from this email exists or not
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message : "Invalid email or password"
        })
    }

    // and if the user with this email exists then we'll have to check his password
    //for checking password
    const isPasswordValid = await bcrypt.compare(password, user.password) // password->(coming from request body) and user.password->(coming from database)

    if(!isPasswordValid){
        return res.status(400).json({
            message : "Invalid username or password"
        })
    }

    // and if our password is correct then we'll move ahead and we'll create a new token.
    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    )

    res.cookie("token", token, getCookieOptions(req))
    res.status(200).json({
        message : "User loggedIn Successfully",
        user: {
            id : user.id,
            username : user.username,
            email : user.email
        }
    })
}
//------------------------------------------------------------------------------------------------------//
// Creating a logout controller

/**
 * @route GET/api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public  // incase we don't get any token, we'll only clear the cookie and we'll not blacklist the token
 */

async function logoutUserController(req, res){

    const token = req.cookies.token // extracting the token from cookies

    //if we do get a token
    if(token){
        await tokenBlackListModel.create({token}) //blacklisting the model
    }

    res.clearCookie("token", getCookieOptions(req))

    res.status(200).json({
        message : "User logged out successfully"
    })
}
//-------------------------------------------------------------------------------------------------------//

// creating controller for get-me 

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */

async function getMeController(req, res){

    const user = await userModel.findById(req.user.id)  // we're getting this id from middleware
    res.status(200).json({
        message : "User details fetched successfully",
        user: {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}


// module.exports = {}  // here this file is exporting an empty object, so authRouter will be requiring a empty object.

module.exports = { 
    registerUserController,   // now in this case this object is getting exported which has this property/function "registerUserController", "loginUserController", "logoutUserController", "getMeController"
    loginUserController,
    logoutUserController,
    getMeController
}
