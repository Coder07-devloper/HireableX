// All the routes related to authentication will be present in this file itself.

const { Router } = require("express")
const authController = require("../controllers/authController")
const authRouter = Router()
const authMiddleware = require("../middlewares/authMiddleware")

 //----------------------------------------------------------------------------------------------------//
// using JSDoc Comments here - can be used for documentation purpose in IDEs 
/**
 * @route - method of route will be "POST"  /api/auth/register
 * @description - register new user
 * @access Public 
 * NOTE - we'll not be creating the controller here in this file, we'll only write the API here and the logic of how a user will register will be written in the controller function which will be written in a seperate file: "authController.js"
 * 
 */

authRouter.post("/register", authController.registerUserController )

//-----------------------------------------------------------------------------------------------------//

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access public
 */

authRouter.post("/login", authController.loginUserController)
//-----------------------------------------------------------------------------------------------------//

/**
 * @route GET/api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public  // incase we don't get any token, we'll only clear the cookie and we'll not blacklist the token
 */
authRouter.get("/logout", authController.logoutUserController)

//-----------------------------------------------------------------------------------------------------//

// NOTE - Now we'll have to create a middleware to check that the request is coming from which user and to check whether the token s blacklisted or not.

/**
 * @route GET /api/auth/get-me
 * @descrition get the details of the currently loggedIn user
 * @access private
 */

authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

module.exports = authRouter
