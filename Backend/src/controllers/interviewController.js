const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/aiService")
const generateAtsResume = require("../services/atsResumeService")
const interviewReportModel = require("../models/interviewReportModel")

/**
 * @description Helper to extract resume text while suppressing non-fatal PDF font warnings.
 * @param {Buffer} resumeFileBuffer - The uploaded resume PDF file buffer.
 * @returns {Promise<string>}
 */
async function extractResumeText(resumeFileBuffer) {
    const parser = new pdfParse.PDFParse(Uint8Array.from(resumeFileBuffer))
    const resumeContent = await parser.getText({
        // This keeps only real parser errors and suppresses harmless pdf.js font warnings.
        verbosity: pdfParse.VerbosityLevel.ERRORS
    })

    return resumeContent.text || ""
}

/***
 * @description Controller to generate interview report based on user's resume, self description and job description
 */

async function generateInterviewReportController(req, res) {
    try {
        const {selfDescription = "", jobDescription = ""} = req.body
        const resumeFile = req.file?.buffer ?? null

        if (!jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if (!resumeFile && !selfDescription.trim()) {
            return res.status(400).json({
                message: "Either a resume or a self description is required"
            })
        }

        let resumeText = ""

        if (resumeFile) {
            resumeText = await extractResumeText(resumeFile)
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        if (!interviewReportByAi) {
            return res.status(502).json({
                message: "Unable to generate the interview report right now"
            })
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Failed to generate interview report"
        })
    }
}

//------------------------------------------------------------------------------------------------------//

/***
 * @description Controller to generate an ATS-friendly resume PDF based on the user's profile and target job description.
 */
async function generateAtsResumeController(req, res) {
    try {
        const {selfDescription = "", jobDescription = ""} = req.body
        const resumeFile = req.file?.buffer ?? null

        if (!jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required"
            })
        }

        if (!resumeFile && !selfDescription.trim()) {
            return res.status(400).json({
                message: "Either a resume or a self description is required"
            })
        }

        let resumeText = ""

        // This extracts plain text from the uploaded PDF so the AI can optimize the resume content.
        if (resumeFile) {
            resumeText = await extractResumeText(resumeFile)
        }

        const atsResume = await generateAtsResume({
            resume: resumeText,
            selfDescription,
            jobDescription,
            userId: req.user.id
        })

        if (!atsResume) {
            return res.status(502).json({
                message: "Unable to generate the ATS-friendly resume right now"
            })
        }

        // These headers tell the browser to download the generated PDF as a file.
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="${atsResume.fileName}"`)
        res.setHeader("X-Generated-Resume-Path", atsResume.pdfPath)

        return res.status(200).send(atsResume.pdfBuffer)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Failed to generate the ATS-friendly resume"
        })
    }
}

//------------------------------------------------------------------------------------------------------//

/***
 * @description Controller to get interview report by interviewId.
 */

async function getInterviewReportByIdController(req, res){

    const {interviewId} = req.params

    const interviewReport = await interviewReportModel.findOne({_id: interviewId, user: req.user.id})

    if(!interviewReport){
        return res.status(400).json({
            message : "Interview report not found"
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    })
}
//------------------------------------------------------------------------------------------------------//

/***
 * @description Controller to get all interview reports of loggedIn user.
 */

async function getAllInterviewReportController(req, res){

    const interviewReports = await interviewReportModel
        .find({user: req.user.id})
        .sort({createdAt: -1})
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message : "Interview reports fetched successfully.",
        interviewReports
    })
}

module.exports = {
    generateInterviewReportController,
    generateAtsResumeController,
    getInterviewReportByIdController,
    getAllInterviewReportController
}
