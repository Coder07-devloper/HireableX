import axios from "axios"

const api=axios.create({
    baseURL: "https://hireablex.onrender.com",
    withCredentials:true,
})

/***
 * @description  Service to generate interview report based on self description, resume and job description
 */

export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type" : "multipart/form-data"
        }
    })

    return response.data
}

//------------------------------------------------------------------------------------------------------//

/**
 * This helper extracts the backend filename from the download headers.
 * @param {string | undefined} dispositionHeader - The Content-Disposition header returned by the server.
 * @returns {string} - The filename that should be used for the downloaded PDF.
 */
const getDownloadFileName = (dispositionHeader) => {
    if (!dispositionHeader) {
        return "hireablex-ats-resume.pdf"
    }

    const fileNameMatch = dispositionHeader.match(/filename="?(?<fileName>[^"]+)"?/i)
    return fileNameMatch?.groups?.fileName || "hireablex-ats-resume.pdf"
}

/**
 * @description Service to generate an ATS-friendly resume PDF for the target job description.
 */
export const generateAtsResumePdf = async ({jobDescription, selfDescription, resumeFile}) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)

    if (resumeFile) {
        formData.append("resume", resumeFile)
    }

    try {
        const response = await api.post("/api/interview/ats-resume", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            responseType: "blob"
        })

        return {
            blob: response.data,
            fileName: getDownloadFileName(response.headers["content-disposition"])
        }
    } catch (error) {
        // This converts blob-based JSON errors into normal readable messages.
        if (error?.response?.data instanceof Blob) {
            const errorText = await error.response.data.text()

            try {
                const parsedError = JSON.parse(errorText)
                throw new Error(parsedError?.message || "Failed to generate ATS resume")
            } catch {
                throw new Error("Failed to generate ATS resume")
            }
        }

        throw error
    }
}
//------------------------------------------------------------------------------------------------------//

/***
 * @description  Service to get interview report by interview Id.
 */

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}

//------------------------------------------------------------------------------------------------------//

/***
 * @description  Service to get all interview reports of loggedIn user.
 */

export const getAllInterviewReport = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}
