import React, {useEffect, useRef, useState} from "react"
import "../style/home.scss"
import {useInterview} from "../hooks/useInterview.js"
import {useNavigate} from "react-router"
import {useAuth} from "../../auth/hooks/useAuth.js"

const BriefcaseIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6.5V8h2.25A1.75 1.75 0 0 1 19 9.75v6.5A1.75 1.75 0 0 1 17.25 18h-10.5A1.75 1.75 0 0 1 5 16.25v-6.5A1.75 1.75 0 0 1 6.75 8H9V6.5Zm1.5 0V8h3V6.5h-3Z" />
    </svg>
)

const ProfileIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Zm0 1.75c-3.18 0-5.75 1.83-5.75 4.08 0 .39.31.7.7.7h10.1a.7.7 0 0 0 .7-.7c0-2.25-2.57-4.08-5.75-4.08Z" />
    </svg>
)

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4.5a.75.75 0 0 1 .53.22l3.25 3.25a.75.75 0 0 1-1.06 1.06l-1.97-1.97v6.69a.75.75 0 0 1-1.5 0V7.06L9.28 9.03a.75.75 0 1 1-1.06-1.06l3.25-3.25A.75.75 0 0 1 12 4.5Zm-5 11a.75.75 0 0 1 .75.75v.5c0 .41.34.75.75.75h7a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 1 1.5 0v.5A2.25 2.25 0 0 1 16.5 19h-7a2.25 2.25 0 0 1-2.25-2.25v-.5A.75.75 0 0 1 7 15.5Z" />
    </svg>
)

const SparkleIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.75a.75.75 0 0 1 .72.54l.96 3.08a1.5 1.5 0 0 0 .99.99l3.08.96a.75.75 0 0 1 0 1.44l-3.08.96a1.5 1.5 0 0 0-.99.99l-.96 3.08a.75.75 0 0 1-1.44 0l-.96-3.08a1.5 1.5 0 0 0-.99-.99l-3.08-.96a.75.75 0 0 1 0-1.44l3.08-.96a1.5 1.5 0 0 0 .99-.99l.96-3.08a.75.75 0 0 1 .72-.54Z" />
    </svg>
)

const DocumentIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 3.75A1.75 1.75 0 0 0 6.25 5.5v13A1.75 1.75 0 0 0 8 20.25h8A1.75 1.75 0 0 0 17.75 18V8.56a2 2 0 0 0-.58-1.41l-2.73-2.82A2 2 0 0 0 13 3.75H8Zm4.5 1.5v2.5c0 .41.34.75.75.75h2.68L12.5 5.25ZM9 11.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
    </svg>
)

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.55 16.03 5.97 12.44a.75.75 0 1 1 1.06-1.06l2.52 2.52 7.42-7.42a.75.75 0 1 1 1.06 1.06l-7.95 7.96a.75.75 0 0 1-1.06 0Z" />
    </svg>
)

const UserIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2.239-7 5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1c0-2.761-3-5-7-5Z" />
    </svg>
)

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17a1 1 0 0 1 0-2h5.586l-1.293-1.293a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L15.586 17H10Z" />
        <path d="M4 5a2 2 0 0 1 2-2h6a1 1 0 1 1 0 2H6v14h6a1 1 0 1 1 0 2H6a2 2 0 0 1-2-2V5Z" />
    </svg>
)

const BrandLogo = () => (
    <svg viewBox="0 0 48 48" aria-hidden="true">
        <defs>
            <linearGradient id="hireablex-home-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7aa8" />
                <stop offset="100%" stopColor="#ff176f" />
            </linearGradient>
        </defs>
        <rect x="4" y="4" width="40" height="40" rx="14" fill="url(#hireablex-home-gradient)" />
        <path d="M16 15h4v8h8v-8h4v18h-4v-6h-8v6h-4V15Z" fill="#ffffff" />
    </svg>
)

const footerLinks = ["Privacy Policy", "Terms of Service", "Help Center"]

const Home = () => {

    const {loading, generateReport, reports, getReports, generateAtsResume} = useInterview()
    const {user, handleLogout} = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [selectedResumeName, setSelectedResumeName] = useState("")
    const [submitError, setSubmitError] = useState("")
    const [atsStatus, setAtsStatus] = useState("")
    const [atsLoading, setAtsLoading] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    // This runs once on mount to load the previously generated interview reports.
    useEffect(() => {
        getReports().catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0] ?? null

        if (!jobDescription.trim()) {
            setSubmitError("Please add the target job description before generating the interview strategy.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            setSubmitError("Please upload a resume or add a self-description before continuing.")
            return
        }

        setSubmitError("")
        setAtsStatus("")

        try {
            const interviewReport = await generateReport({jobDescription, selfDescription, resumeFile})

            if (interviewReport?._id) {
                navigate(`/interview/${interviewReport._id}`)
                return
            }

            setSubmitError("We couldn't generate your interview plan right now. Please try again.")
        } catch (error) {
            setSubmitError(
                error?.response?.data?.message ||
                "We couldn't generate your interview plan right now. Please try again."
            )
        }
    }

    const handleGenerateAtsResume = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0] ?? null

        if (!jobDescription.trim()) {
            setSubmitError("Please add the target job description before generating the ATS resume.")
            return
        }

        if (!resumeFile && !selfDescription.trim()) {
            setSubmitError("Please upload a resume or add a self-description before generating the ATS resume.")
            return
        }

        setSubmitError("")
        setAtsStatus("")
        setAtsLoading(true)

        try {
            const response = await generateAtsResume({jobDescription, selfDescription, resumeFile})
            const pdfUrl = URL.createObjectURL(response.blob)
            const downloadLink = document.createElement("a")

            downloadLink.href = pdfUrl
            downloadLink.download = response.fileName || "hireablex-ats-resume.pdf"
            document.body.appendChild(downloadLink)
            downloadLink.click()
            downloadLink.remove()
            URL.revokeObjectURL(pdfUrl)

            setAtsStatus("ATS-friendly resume downloaded successfully.")
        } catch (error) {
            setSubmitError(
                error?.message ||
                error?.response?.data?.message ||
                "We couldn't generate the ATS-friendly resume right now. Please try again."
            )
        } finally {
            setAtsLoading(false)
        }
    }

    if(loading && reports.length === 0){
        return (
            <main className="loading-screen">
                <h1>Loading your interview plan</h1>
            </main>
        )
    }

    const handleViewReport = (reportId) => {
        navigate(`/interview/${reportId}`)
    }

    const handleLogoutClick = async () => {
        const didLogout = await handleLogout()

        if (didLogout) {
            navigate("/login")
        }
    }

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Recently generated"
        }

        return new Date(dateValue).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    return (
        <main className="home">
            <section className="plan-builder">
                <div className="page-toolbar">
                    <div className="brand-badge">
                        <span className="brand-badge__logo">
                            <BrandLogo />
                        </span>
                        <span className="brand-badge__text">HireableX</span>
                    </div>

                    <div className={`profile-menu ${menuOpen ? "profile-menu--open" : ""}`}>
                        <button
                            type="button"
                            className="profile-menu__trigger"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <span className="profile-menu__avatar">
                                <UserIcon />
                            </span>
                        </button>

                        {menuOpen && (
                            <div className="profile-menu__panel">
                                <p className="profile-menu__label">Signed in as</p>
                                <p className="profile-menu__email">{user?.email || "No email available"}</p>
                                <button
                                    type="button"
                                    className="profile-menu__logout"
                                    onClick={handleLogoutClick}
                                >
                                    <span className="profile-menu__logout-icon">
                                        <LogoutIcon />
                                    </span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <header className="plan-builder__hero">
                    <h1>
                        Create Your Custom <span>Interview Plan</span>
                    </h1>
                    <p>
                        Let our AI analyze the job requirements and your unique profile to build a
                        winning strategy.
                    </p>
                </header>

                <section className="plan-card" aria-label="Interview plan form">
                    <div className="plan-card__content">
                        <section className="plan-panel plan-panel--description">
                            <div className="plan-panel__header">
                                <div className="plan-panel__title">
                                    <span className="plan-panel__icon">
                                        <BriefcaseIcon />
                                    </span>
                                    <label htmlFor="jobDescription">Target Job Description</label>
                                </div>
                                <span className="plan-panel__tag">Required</span>
                            </div>

                            <div className="plan-panel__field plan-panel__field--large">
                                <textarea
                                    onChange={(e)=>{setJobDescription(e.target.value)}}
                                    name="jobDescription"
                                    id="jobDescription"
                                    maxLength="5000"
                                    placeholder={`Paste the full job description here...

e.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design."`}
                                />
                                <span className="plan-panel__counter">0 / 5000 chars</span>
                            </div>
                        </section>

                        <section className="plan-panel plan-panel--profile">
                            <div className="plan-panel__header">
                                <div className="plan-panel__title">
                                    <span className="plan-panel__icon">
                                        <ProfileIcon />
                                    </span>
                                    <h2>Your Profile</h2>
                                </div>
                            </div>

                            <div className="plan-panel__group">
                                <div className="plan-panel__subheading">
                                    <span>Upload Resume</span>
                                    <button type="button">Best Results</button>
                                </div>

                                <label className="upload-dropzone" htmlFor="resume">
                                    <span className="upload-dropzone__badge">
                                        <UploadIcon />
                                    </span>
                                    <strong>Click to upload or drag &amp; drop</strong>
                                    <small>PDF or DOCX Max: 5MB</small>
                                </label>
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    name="resume"
                                    id="resume"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0] ?? null
                                        setSelectedResumeName(selectedFile ? selectedFile.name : "")
                                    }}
                                />
                                {selectedResumeName && (
                                    <p className="upload-dropzone__status">
                                        Document uploaded successfully - {selectedResumeName}
                                    </p>
                                )}
                            </div>

                            <div className="plan-panel__divider" aria-hidden="true">
                                <span>OR</span>
                            </div>

                            <div className="plan-panel__group">
                                <label className="plan-panel__subheading" htmlFor="selfDescription">
                                    Quick Self-Description
                                </label>
                                <div className="plan-panel__field">
                                    <textarea
                                        onChange={(e)=>{setSelfDescription(e.target.value)}}
                                        name="selfDescription"
                                        id="selfDescription"
                                        placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                    />
                                </div>
                            </div>

                            <div className="plan-panel__note">
                                <span className="plan-panel__note-icon">
                                    <CheckIcon />
                                </span>
                                <p>
                                    Either a Resume or a Self Description is required to generate a
                                    personalized plan.
                                </p>
                            </div>
                        </section>
                    </div>

                    <footer className="plan-card__footer">
                        <div className="plan-card__footer-copy">
                            <p className="plan-card__meta">AI-Powered Strategy Generation | Approx 30s</p>
                            {submitError && <p className="plan-card__error">{submitError}</p>}
                            {atsStatus && <p className="plan-card__success">{atsStatus}</p>}
                        </div>

                        <div className="plan-card__actions">
                            <button
                                onClick={handleGenerateAtsResume}
                                type="button"
                                className="plan-card__cta plan-card__cta--secondary"
                                disabled={atsLoading}
                            >
                                <span className="plan-card__cta-icon">
                                    <DocumentIcon />
                                </span>
                                {atsLoading ? "Generating ATS Resume..." : "Generate ATS Resume PDF"}
                            </button>

                            <button
                                onClick={handleGenerateReport}
                                type="button"
                                className="plan-card__cta">
                                <span className="plan-card__cta-icon">
                                    <SparkleIcon />
                                </span>
                                Generate My Interview Strategy
                            </button>
                        </div>
                    </footer>
                </section>

                <section className="report-gallery" aria-label="Generated interview reports">
                    <div className="report-gallery__header">
                        <div>
                            <p className="report-gallery__eyebrow">Your Reports</p>
                            <h2>Previously Generated Interview Plans</h2>
                        </div>
                        <span className="report-gallery__count">{reports.length} reports</span>
                    </div>

                    {reports.length > 0 ? (
                        <div className="report-grid">
                            {reports.map((report) => (
                                <button
                                    key={report._id}
                                    type="button"
                                    className="report-card"
                                    onClick={() => handleViewReport(report._id)}
                                >
                                    <div className="report-card__top">
                                        <span className="report-card__badge">Interview Report</span>
                                        <span className="report-card__score">{report.matchScore}% match</span>
                                    </div>

                                    <h3 className="report-card__title">{report.title}</h3>
                                    <p className="report-card__meta">Generated on {formatDate(report.createdAt)}</p>
                                    <span className="report-card__cta">View detailed report</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="report-gallery__empty">
                            <h3>No interview reports yet</h3>
                            <p>Your generated reports will appear here once you create your first interview strategy.</p>
                        </div>
                    )}
                </section>

                <footer className="plan-builder__links">
                    {footerLinks.map((link) => (
                        <button key={link} type="button">
                            {link}
                        </button>
                    ))}
                </footer>
            </section>
        </main>
    )
}

export default Home
