const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  httpOptions: { apiVersion: "v1beta" },
});

const PRIMARY_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
const FALLBACK_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];
const ALL_MODELS = [...PRIMARY_MODELS, ...FALLBACK_MODELS];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const EXAMPLE_RESPONSE_PATH = path.join(__dirname, "../../aiResponse.txt");

function loadExampleResponse() {
  try {
    const fileContent = fs.readFileSync(EXAMPLE_RESPONSE_PATH, "utf8");
    const firstBraceIndex = fileContent.indexOf("{");
    const lastBraceIndex = fileContent.lastIndexOf("}");

    if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
      return fileContent.slice(firstBraceIndex, lastBraceIndex + 1);
    }
  } catch (error) {
    console.log("Example response template could not be loaded:", error.message);
  }

  return "";
}

const EXAMPLE_RESPONSE = loadExampleResponse();

const reportSectionSchema = z.object({
  question: z.string().min(1),
  intention: z.string().min(1),
  answer: z.string().min(1),
});

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(reportSectionSchema).min(4),
  behavioralQuestions: z.array(reportSectionSchema).min(2),
  skillGaps: z.array(z.object({
    skill: z.string().min(1),
    severity: z.enum(["low", "medium", "high"]),
  })).min(3),
  preparationPlan: z.array(z.object({
    day: z.number(),
    focus: z.string().min(1),
    tasks: z.array(z.string().min(1)).min(1),
  })).min(5),
  title: z.string().min(1),
});

function extractJsonBlock(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const firstBraceIndex = text.indexOf("{");
  const lastBraceIndex = text.lastIndexOf("}");

  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    return null;
  }

  return text.slice(firstBraceIndex, lastBraceIndex + 1);
}

function parseJsonResponse(rawText) {
  const jsonBlock = extractJsonBlock(rawText);

  if (!jsonBlock) {
    return null;
  }

  try {
    return JSON.parse(jsonBlock);
  } catch (error) {
    return null;
  }
}

function normalizeQuestions(items) {
  return Array.isArray(items)
    ? items
        .map((item) => ({
          question: item?.question || item?.questions || "",
          intention: item?.intention || item?.intenstion || "",
          answer: item?.answer || "",
        }))
        .filter((item) => item.question && item.intention && item.answer)
    : [];
}

function normalizeSkillGaps(items) {
  return Array.isArray(items)
    ? items
        .map((item) => ({
          skill: item?.skill || "",
          severity: ["low", "medium", "high"].includes(item?.severity) ? item.severity : "medium",
        }))
        .filter((item) => item.skill)
    : [];
}

function normalizePreparationPlan(items) {
  return Array.isArray(items)
    ? items
        .map((item, index) => ({
          day: Number(item?.day) || index + 1,
          focus: item?.focus || `Preparation Day ${index + 1}`,
          tasks: Array.isArray(item?.tasks)
            ? item.tasks.filter((task) => typeof task === "string" && task.trim())
            : typeof item?.tasks === "string" && item.tasks.trim()
              ? [item.tasks]
              : [],
        }))
        .filter((item) => item.focus && item.tasks.length > 0)
    : [];
}

function fixOutput(data) {
  return {
    matchScore: Math.min(100, Math.max(0, Number(data?.matchScore) || 75)),
    technicalQuestions: normalizeQuestions(data?.technicalQuestions),
    behavioralQuestions: normalizeQuestions(data?.behavioralQuestions || data?.behaviouralQuestions),
    skillGaps: normalizeSkillGaps(data?.skillGaps),
    preparationPlan: normalizePreparationPlan(data?.preparationPlan),
    title: typeof data?.title === "string" && data.title.trim() ? data.title.trim() : "Interview Report",
  };
}

function validateReport(candidate) {
  const fixed = fixOutput(candidate);
  const validated = interviewReportSchema.safeParse(fixed);

  if (validated.success) {
    return { success: true, data: validated.data };
  }

  return { success: false, fixed, issues: validated.error.issues };
}

function buildContext({ resume, selfDescription, jobDescription }) {
  return `
Resume:
${resume || "No resume provided"}

Self Description:
${selfDescription || "No self description provided"}

Job Description:
${jobDescription || "No job description provided"}
`;
}

function buildMainPrompt(contextBlock) {
  return `
You are an expert AI interview strategist.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in code fences.
Do not omit any required section.

The output must strictly use this exact shape and field names:
${EXAMPLE_RESPONSE}

Strict requirements:
- Generate at least 4 technicalQuestions
- Generate at least 2 behavioralQuestions
- Generate at least 3 skillGaps
- Generate at least 5 preparationPlan items
- Every question object must include question, intention, and answer
- Every preparationPlan item must include day, focus, and tasks
- tasks must always be an array of strings
- Make the content specific to the resume, self description, and job description
- Do not return empty arrays

${contextBlock}
`;
}

function buildRepairPrompt(contextBlock, previousOutput) {
  return `
You previously generated an incomplete interview report.

Return ONLY valid JSON.
Do not use markdown.
Do not add commentary.

The previous incomplete output was:
${JSON.stringify(previousOutput, null, 2)}

Fix it so the final JSON satisfies all of these conditions:
- technicalQuestions length >= 4
- behavioralQuestions length >= 2
- skillGaps length >= 3
- preparationPlan length >= 5
- Each question item contains question, intention, answer
- Each preparationPlan item contains day, focus, tasks
- tasks is an array of strings

Use this target format:
${EXAMPLE_RESPONSE}

${contextBlock}
`;
}

async function requestModel({ model, prompt }) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return response.text;
}

async function runPromptAcrossModels(prompt, label) {
  let lastError = null;

  for (const model of ALL_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const rawText = await requestModel({ model, prompt });
        const parsed = parseJsonResponse(rawText);

        if (!parsed) {
          console.log(`Invalid JSON from AI [${model}] ${label} attempt ${attempt}`);
          if (attempt < 2) {
            await wait(1000 * attempt);
          }
          continue;
        }

        const validated = validateReport(parsed);

        if (validated.success) {
          console.log("\nFINAL VALID OUTPUT:\n", JSON.stringify(validated.data, null, 2));
          return validated.data;
        }

        console.log(`Schema validation failed [${model}] ${label} attempt ${attempt}:`, validated.issues);
        console.log("Normalized AI output:", JSON.stringify(validated.fixed, null, 2));

        if (attempt < 2) {
          await wait(1000 * attempt);
        }
      } catch (error) {
        lastError = error;
        console.log(`AI ERROR [${model}] ${label} attempt ${attempt}:`, error.message);
        const isUnavailable = /503|UNAVAILABLE|high demand/i.test(error.message);

        if (isUnavailable && attempt < 2) {
          await wait(1200 * attempt);
          continue;
        }

        break;
      }
    }
  }

  if (lastError) {
    console.log("AI ERROR:", lastError.message);
  }

  return null;
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  try {
    const contextBlock = buildContext({ resume, selfDescription, jobDescription });

    const firstPass = await runPromptAcrossModels(buildMainPrompt(contextBlock), "main");

    if (firstPass) {
      return firstPass;
    }

    const repairSeed = {
      matchScore: 75,
      technicalQuestions: [],
      behavioralQuestions: [],
      skillGaps: [],
      preparationPlan: [],
      title: "Interview Report",
    };

    const repaired = await runPromptAcrossModels(
      buildRepairPrompt(contextBlock, repairSeed),
      "repair"
    );

    return repaired;
  } catch (error) {
    console.log("AI ERROR:", error.message);
    return null;
  }
}

module.exports = generateInterviewReport;
