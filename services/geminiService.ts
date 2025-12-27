import { GoogleGenerativeAI } from "@google/generative-ai";
import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

// Setup Google GenAI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing VITE_GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = 'gemini-1.5-flash'; // Standard model

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentWithRetry = async (prompt: string, attachmentParts?: any[], retries = 3, initialDelay = 1000): Promise<string> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      let result;
      if (attachmentParts) {
        result = await model.generateContent([prompt, ...attachmentParts]);
      } else {
        result = await model.generateContent(prompt);
      }
      const response = await result.response;
      return response.text();

    } catch (error: any) {
      if (error?.status === 429 || error?.toString().includes('429') || error?.toString().includes('Quota exceeded')) {
        attempt++;
        if (attempt >= retries) throw error;
        const waitTime = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
        await delay(waitTime);
      } else {
        console.error("Gemini API Error:", error);
        throw error;
      }
    }
  }
  throw new Error("Failed to generate content after retries");
};

function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
}

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
  try {
    const prompt = `
      You are an expert career consultant for B.Tech students.
      Analyze the provided resume document.
      
      CRITICAL: OUTPUT VALID JSON ONLY. NO MARKDOWN BLOCK.
      
      Extract:
      - Name, Email
      - University
      - Skills (Array of strings)
      - Summary
      - Experience Level
      - Identify 3 missing skills for a generic tech role in Hyderabad.

      JSON Schema:
      {
        "name": "string",
        "email": "string",
        "university": "string",
        "skills": ["string"],
        "missingSkills": ["string"],
        "summary": "string",
        "experienceLevel": "string"
      }
    `;

    const attachmentPart = fileToGenerativePart(base64Data, mimeType);
    const text = await generateContentWithRetry(prompt, [attachmentPart]);
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as UserProfile;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const matchInternships = async (profile: UserProfile, internships: Internship[]): Promise<Internship[]> => {
  try {
    const internshipBriefs = internships.map(i => ({
      id: i.id,
      title: i.title,
      company: i.company,
      requiredSkills: i.requiredSkills,
      description: i.description
    }));

    const prompt = `
      Student Skills: ${profile.skills.join(', ')}.
      Summary: ${profile.summary}.
      
      Internships: ${JSON.stringify(internshipBriefs)}.
      
      Rank internships by relevance.
      For each, provide "matchScore" (0-100) and "matchReason" (1 sentence).
      
      OUTPUT: VALID JSON ARRAY ONLY. NO MARKDOWN.
      Example: [{"id": "1", "matchScore": 90, "matchReason": "Good fit"}]
    `;

    const text = await generateContentWithRetry(prompt);
    const cleanText = text.replace(/```json|```/g, '').trim();
    const rankings = JSON.parse(cleanText);

    // Merge rankings back into full internship objects
    const rankedInternships = internships.map(internship => {
      const rank = rankings.find((r: any) => r.id === internship.id);
      return {
        ...internship,
        matchScore: rank?.matchScore || 0,
        matchReason: rank?.matchReason || "AI analysis pending..."
      };
    });

    // Sort by score descending
    return rankedInternships.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  } catch (error) {
    console.error("Error matching internships:", error);
    return internships.map(i => ({ ...i, matchScore: 50, matchReason: "Basic match logic applied." }));
  }
};

export const generateCareerPath = async (profile: UserProfile, targetRole: string, targetCompany: string): Promise<LearningRoadmap> => {
  const prompt = `
      Profile Skills: ${profile.skills.join(', ')}.
      Experience: ${profile.experienceLevel}.
      Target: ${targetRole} at ${targetCompany}.

      Generate a Career Roadmap.
      
      CRITICAL: OUTPUT VALID JSON ONLY. NO MARKDOWN.
      
      Response Format:
      {
          "readinessScore": 0,
          "strongSkills": [{"skill": "", "reason": ""}],
          "skillsToImprove": [{"skill": "", "reason": ""}],
          "skillsToLearn": [{"skill": "", "reason": ""}],
          "roadmap": [{"month": "", "skills": [], "tools": [], "task": ""}],
          "recommendedProjects": [{"name": "", "skillsCovered": [], "reason": ""}],
          "profileSuggestions": [],
          "nextImmediateStep": ""
      }
    `;

  const text = await generateContentWithRetry(prompt);
  const cleanText = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanText) as LearningRoadmap;
};

export const getChatResponse = async (history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const chat = model.startChat({
    history: history,
  });

  try {
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (e) {
    console.error("Chat error", e);
    return "I'm having trouble connecting right now. Please try again.";
  }
};

export const generateATSResume = async (currentData: Partial<ResumeData>): Promise<ResumeData> => {
  const prompt = `
      Act as an expert ATS Resume Writer. I will provide raw data about a candidate.
      Your job is to polish this data into a high-scoring, professional ATS-optimized resume format.
      
      Raw Data:
      ${JSON.stringify(currentData)}
      
      Instructions:
      1. Summary: Write a compelling 3-4 line professional summary emphasizing their key skills and experience level.
      2. Projects: Rewrite project descriptions to use the STAR method (Situation, Task, Action, Result). Use strong action verbs (e.g., "Engineered", "Deployed", "Optimized").
      3. Experience: Polish experience bullets to be quantifiable if possible.
      4. Skills: Group them logically if not already.
      5. Output JSON matching the ResumeData interface structure exactly.
      
      CRITICAL: OUTPUT VALID JSON ONLY. NO MARKDOWN.
    `;

  const text = await generateContentWithRetry(prompt);
  const cleanText = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleanText) as ResumeData;
};