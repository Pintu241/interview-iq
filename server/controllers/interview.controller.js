import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

/**
 * Controller: analyzeResume
 * Endpoint: POST /api/interview/resume
 * Purpose:
 * 1. Read an uploaded PDF resume file from disk.
 * 2. Parse the PDF page-by-page using pdfjs-dist.
 * 3. Feed the parsed text to the AI model with strict instruction to extract:
 *    - Role, Experience, Projects, and Skills.
 * 4. Return this structured JSON back to the client and delete the temp file.
 */
export const analyzeResume = async (req, res) => {
  try {
    // Check if the file was successfully uploaded by multer middleware
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    // Read the temporary file into a buffer
    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    // Load PDF document from binary data
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let resumeText = "";

    // Iterate through pages and join extracted string tokens
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    // Clean up excessive whitespace formatting
    resumeText = resumeText.replace(/\s+/g, " ").trim();

    // Prepare system instructions and input context for LLM extraction
    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];

    // Call unified AI Completion service
    const aiResponse = await askAi(messages)
    const parsed = JSON.parse(aiResponse);

    // Synchronously delete the parsed temp file from local server storage
    fs.unlinkSync(filepath)

    // Send back extracted details to populate setup fields on frontend
    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error("Resume analysis error:", error);

    // Delete temp file if error occurs mid-process to prevent memory leaks
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


/**
 * Controller: generateQuestion
 * Endpoint: POST /api/interview/generate-questions
 * Purpose:
 * 1. Validate inputs (role, experience, mode) and credit requirements.
 * 2. Formulate a detailed user profile prompt (including projects/skills/resume).
 * 3. Send system rules to LLM instructing it to generate exactly 5 interview questions with specific difficulty levels.
 * 4. Deduct 50 credits from user balance.
 * 5. Create and save a new Interview document with the generated questions.
 */
export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    // Retrieve requesting user profile
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Enforce billing/credit rule
    if (user.credits < 50) {
      return res.status(400).json({ message: "Not enough credits. Minimum 50 required." });
    }

    // Formatting fallback representations
    const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

    if (!userPrompt.trim()) {
      return res.status(400).json({ message: "Prompt content is empty." });
    }

    // Setup system behavior for a human-like professional interviewer
    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience, interviewMode, projects, skills, and resume details.
`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    // Call unified AI Completion service
    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    // Split AI lines into individual questions array
    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({ message: "AI failed to generate questions." });
    }

    // Billing deduction
    user.credits -= 50;
    await user.save();

    // Persist mock interview session in DB
    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      }))
    })

    // Respond back to frontend to initiate interview environment
    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to create interview ${error}` })
  }
}


/**
 * Controller: submitAnswer
 * Endpoint: POST /api/interview/submit-answer
 * Purpose:
 * 1. Receive candidate's answer text and time elapsed metrics.
 * 2. Handle scenario of empty answers (auto score 0, skip AI evaluation).
 * 3. Handle timeout scenario (auto score 0, skip AI evaluation).
 * 4. Submit active question and candidate response to LLM.
 * 5. LLM evaluates response on confidence, communication, and correctness, returning scores + short feedback.
 * 6. Save evaluation metrics into corresponding question element in DB.
 */
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // Rule: Null or empty response
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    // Rule: Response time exceeds question time limit
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();
      return res.json({ feedback: question.feedback });
    }

    // Formulate LLM evaluation task structure
    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];

    // Evaluate response using unified AI completions
    const aiResponse = await askAi(messages)
    const parsed = JSON.parse(aiResponse);

    // Save metrics
    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    
    await interview.save();

    return res.status(200).json({ feedback: parsed.feedback })
  } catch (error) {
    return res.status(500).json({ message: `failed to submit answer ${error}` })
  }
}


/**
 * Controller: finishInterview
 * Endpoint: POST /api/interview/finish
 * Purpose:
 * 1. Conclude the interview session.
 * 2. Calculate average scores across all answered questions.
 * 3. Mark status of the Interview document as "completed" in DB.
 * 4. Return aggregated scoring metrics + questions breakdown for the report card page.
 */
export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body
    const interview = await Interview.findById(interviewId)
    if (!interview) {
      return res.status(400).json({ message: "failed to find Interview" })
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    // Accumulate total scores
    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    // Compute averages
    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    // Update document status
    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: `failed to finish Interview ${error}` })
  }
}


/**
 * Controller: getMyInterviews
 * Endpoint: GET /api/interview/get-interview
 * Purpose:
 * Retrieve a list of past interview history reports for the authenticated user (sorted by date).
 */
export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews)

  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview ${error}` })
  }
}


/**
 * Controller: getInterviewReport
 * Endpoint: GET /api/interview/report/:id
 * Purpose:
 * Fetch detailed metrics and itemized breakdown of questions for a specific interview session.
 */
export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });

  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Interview report ${error}` })
  }
}
