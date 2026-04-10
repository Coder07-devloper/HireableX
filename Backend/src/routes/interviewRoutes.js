const express = require("express");
const interviewRouter = express.Router();
const authMiddleware = require("../middlewares/authMiddleware")
const interviewController = require("../controllers/interviewController")
const upload = require("../middlewares/fileMiddleware")




/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController)

//------------------------------------------------------------------------------------------------------//

/**
 * @route POST /api/interview/ats-resume
 * @description generate an ATS-friendly resume PDF tailored to the target job description
 * @access private
 */
interviewRouter.post("/ats-resume", authMiddleware.authUser, upload.single("resume"), interviewController.generateAtsResumeController)

//------------------------------------------------------------------------------------------------------//

/**
 * @route GET  /api/interview/report/:interviewId
 * @description get interview report by nterviewId
 * @access private
*/
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

//-----------------------------------------------------------------------------------------------------//

/***
 * @route GET /api/interview/
 * @description get all interview reports of a specific  loggedIn user.
 * @access private
 */

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportController)


module.exports = interviewRouter
