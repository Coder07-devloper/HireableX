import {getAllInterviewReport, generateAtsResumePdf, generateInterviewReport, getInterviewReportById} from "../services/interviewApi.js"
import {useContext} from "react"
import {InterviewContext} from "../interviewContext"


export const useInterview = () => {

    const context = useContext(InterviewContext)

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            const createdReport = response?.interviewReport ?? null

            if (createdReport) {
                setReport(createdReport)
            }

            return createdReport
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            const fetchedReport = response?.interviewReport ?? null

            if (fetchedReport) {
                setReport(fetchedReport)
            }

            return fetchedReport
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReport()
            const interviewReports = response?.interviewReports ?? []
            setReports(interviewReports)
            return interviewReports
        } finally {
            setLoading(false)
        }
    }

    const generateAtsResume = async ({ jobDescription, selfDescription, resumeFile }) => {
        const response = await generateAtsResumePdf({ jobDescription, selfDescription, resumeFile })
        return response
    }

    return {loading, report, reports, generateReport, getReportById, getReports, generateAtsResume}
}
