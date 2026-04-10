const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { GoogleGenAI } = require("@google/genai");

// This client is responsible for calling Gemini to generate the ATS resume HTML.
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
    httpOptions: { apiVersion: "v1beta" },
});

// These are the models we will try in order until we get a valid HTML resume.
const ATS_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
];

// This folder stores the generated HTML and PDF files for debugging and reuse.
const GENERATED_RESUME_DIRECTORY = path.join(__dirname, "../../generated/ats-resumes");

/**
 * This helper pauses execution for a short time before a retry.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This helper removes markdown code fences if the model wraps the HTML in them.
 * @param {string} rawText - The raw text returned by the AI model.
 * @returns {string} - A cleaned HTML string.
 */
function stripCodeFences(rawText) {
    if (!rawText || typeof rawText !== "string") {
        return "";
    }

    return rawText
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}

/**
 * This helper ensures the generated content looks like a complete HTML document.
 * @param {string} html - The generated HTML text.
 * @returns {boolean} - True when the HTML looks usable for Puppeteer.
 */
function isValidHtmlDocument(html) {
    return Boolean(
        html &&
        typeof html === "string" &&
        /<html/i.test(html) &&
        /<body/i.test(html) &&
        /<\/html>/i.test(html)
    );
}

/**
 * This helper creates a safe file slug from the target job description.
 * @param {string} jobDescription - The job description entered by the user.
 * @returns {string} - A clean filename-safe slug.
 */
function buildJobSlug(jobDescription) {
    const sourceText = (jobDescription || "target-role")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .trim();

    const slug = sourceText
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 6)
        .join("-");

    return slug || "target-role";
}

/**
 * This prompt tells Gemini to keep the resume visually close to the provided reference resume
 * while tailoring the content to the target job description.
 * @param {object} payload - The candidate and job data used for generation.
 * @param {string} payload.resume - The extracted resume text.
 * @param {string} payload.selfDescription - The optional self description supplied by the user.
 * @param {string} payload.jobDescription - The target job description.
 * @returns {string} - The final prompt sent to the AI model.
 */
function buildAtsResumePrompt({ resume, selfDescription, jobDescription }) {
    return `
You are an expert ATS resume writer and HTML resume designer.

Return ONLY a complete HTML document.
Do not use markdown.
Do not wrap the response in code fences.
Do not explain anything before or after the HTML.

Goal:
- Create an ATS-friendly resume tailored to the target job description.
- Keep the visual structure close to this reference layout:
  1. Single column resume.
  2. Candidate name at the top in uppercase and slightly larger.
  3. One contact line directly below the name in this style:
     phone | email | LinkedIn/portfolio
  4. Section order should closely follow:
     SUMMARY
     EDUCATION
     EXPERIENCE
     PROJECTS
     TECHNICAL SKILLS
     OTHER
  5. Section headings should be uppercase, clean, and ATS-friendly.
  6. Use simple bullet points and left-right role/date alignment where useful.
  7. Keep the design minimal, text-first, and printer-friendly.

Critical HTML requirements:
- Return a full HTML document with html, head, style, and body tags.
- Use only inline CSS inside a single style tag.
- The PDF must look clean on A4 paper.
- Use a white background and dark readable text.
- Do not use tables, icons, images, progress bars, columns, charts, or decorative graphics.
- Use semantic HTML like h1, h2, p, ul, li, section, and div.
- Every real contact URL must be an active anchor tag.
- Make phone clickable with tel:
- Make email clickable with mailto:
- Make LinkedIn / GitHub / portfolio / project links clickable with full https URLs.
- Hyperlinks should remain subtle and ATS-safe.
- Keep the output concise enough to fit naturally in a strong one-page resume whenever possible.

Content rules:
- Tailor the summary, skills, project bullets, and experience bullets to the target job description.
- Emphasize relevant keywords from the job description without keyword stuffing.
- Do not invent fake companies, projects, dates, percentages, or achievements.
- If something is not present in the source content, do not fabricate it.
- Preserve and surface the candidate's real links whenever they are available in the source.
- Improve wording, prioritization, and ATS keyword targeting.

Source resume text:
${resume || "No resume text was provided."}

Self description:
${selfDescription || "No self description was provided."}

Target job description:
${jobDescription || "No job description was provided."}
`;
}

/**
 * This helper sends the prompt to Gemini and returns the cleaned HTML string.
 * @param {string} model - The Gemini model name.
 * @param {string} prompt - The prompt sent to Gemini.
 * @returns {Promise<string>} - The generated HTML string.
 */
async function requestAtsHtml({ model, prompt }) {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "text/plain",
        },
    });

    return stripCodeFences(response.text);
}

/**
 * This helper tries the configured Gemini models until it receives valid HTML.
 * @param {string} prompt - The prompt used for HTML generation.
 * @returns {Promise<string | null>} - A valid HTML document or null.
 */
async function generateAtsHtml(prompt) {
    let lastError = null;

    for (const model of ATS_MODELS) {
        for (let attempt = 1; attempt <= 2; attempt += 1) {
            try {
                const html = await requestAtsHtml({ model, prompt });

                if (isValidHtmlDocument(html)) {
                    return html;
                }

                console.log(`ATS HTML validation failed [${model}] attempt ${attempt}`);

                if (attempt < 2) {
                    await wait(800 * attempt);
                }
            } catch (error) {
                lastError = error;
                console.log(`ATS resume AI error [${model}] attempt ${attempt}:`, error.message);

                if (attempt < 2) {
                    await wait(1000 * attempt);
                }
            }
        }
    }

    if (lastError) {
        console.log("ATS resume generation failed:", lastError.message);
    }

    return null;
}

/**
 * This helper renders the AI-generated HTML into a PDF using Puppeteer.
 * @param {string} html - The HTML document returned by the AI model.
 * @returns {Promise<Buffer>} - The generated PDF file as a buffer.
 */
async function createPdfFromHtml(html) {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        // This sets the resume HTML into the page so Chromium can render it.
        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        // This keeps the CSS rendering closer to what the browser sees on screen.
        await page.emulateMediaType("screen");

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: "18px",
                right: "18px",
                bottom: "18px",
                left: "18px",
            },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

/**
 * This helper persists the generated HTML and PDF files to disk.
 * @param {object} payload - The files that need to be saved.
 * @param {string} payload.userId - The current user's id.
 * @param {string} payload.jobSlug - A safe slug for the target role.
 * @param {string} payload.html - The generated HTML content.
 * @param {Buffer} payload.pdfBuffer - The generated PDF buffer.
 * @returns {Promise<{ htmlPath: string, pdfPath: string, fileName: string }>}
 */
async function saveGeneratedResumeFiles({ userId, jobSlug, html, pdfBuffer }) {
    const timestamp = Date.now();
    const fileBaseName = `hireablex-ats-${jobSlug}-${timestamp}`;
    const userDirectory = path.join(GENERATED_RESUME_DIRECTORY, String(userId || "guest"));
    const htmlPath = path.join(userDirectory, `${fileBaseName}.html`);
    const pdfPath = path.join(userDirectory, `${fileBaseName}.pdf`);

    // This ensures the output folder exists before writing the generated files.
    await fs.promises.mkdir(userDirectory, { recursive: true });
    await fs.promises.writeFile(htmlPath, html, "utf8");
    await fs.promises.writeFile(pdfPath, pdfBuffer);

    return {
        htmlPath,
        pdfPath,
        fileName: `${fileBaseName}.pdf`,
    };
}

/**
 * This service generates ATS resume HTML, converts it to PDF, and saves both files.
 * @param {object} payload - The data needed to build the ATS resume.
 * @param {string} payload.resume - The extracted resume text.
 * @param {string} payload.selfDescription - The optional self description.
 * @param {string} payload.jobDescription - The target job description.
 * @param {string} payload.userId - The current user's id.
 * @returns {Promise<{ pdfBuffer: Buffer, htmlPath: string, pdfPath: string, fileName: string } | null>}
 */
async function generateAtsResume({ resume, selfDescription, jobDescription, userId }) {
    try {
        const prompt = buildAtsResumePrompt({
            resume,
            selfDescription,
            jobDescription,
        });

        const html = await generateAtsHtml(prompt);

        if (!html) {
            return null;
        }

        const pdfBuffer = await createPdfFromHtml(html);
        const jobSlug = buildJobSlug(jobDescription);
        const savedFiles = await saveGeneratedResumeFiles({
            userId,
            jobSlug,
            html,
            pdfBuffer,
        });

        return {
            pdfBuffer,
            htmlPath: savedFiles.htmlPath,
            pdfPath: savedFiles.pdfPath,
            fileName: savedFiles.fileName,
        };
    } catch (error) {
        console.log("ATS resume service failed:", error.message);
        return null;
    }
}

module.exports = generateAtsResume;
