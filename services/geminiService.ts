import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

// Setup Puter
const MODEL_NAME = 'google/gemini-2.0-flash-001';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateContentWithRetry = async (prompt: string, attachment?: string, retries = 3, initialDelay = 1000): Promise<string> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      // Puter.js chat signature: puter.ai.chat(message, optionOrAttachment, option)
      // If attachment is present: puter.ai.chat(message, attachment, { model: ... })
      // If no attachment: puter.ai.chat(message, { model: ... })

      let response;
      if (attachment) {
        response = await puter.ai.chat(prompt, attachment, { model: MODEL_NAME });
      } else {
        response = await puter.ai.chat(prompt, { model: MODEL_NAME });
      }

      // Puter returns the response string directly (or an object if full response requested, but usually string in simple usage)
      // Based on docs: .then(response => puter.print(response)) implies it returns the text.
      // Let's assume response is a string.

      if (typeof response === 'object' && response?.message?.content) {
        return response.message.content;
      } else if (typeof response === 'object' && response?.text) {
        return response.text;
      }

      return response as string;

    } catch (error: any) {
      if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('Quota exceeded')) {
        attempt++;
        if (attempt >= retries) throw error;
        const waitTime = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
        await delay(waitTime);
      } else {
        console.error("Puter AI Error:", error);
        throw error;
      }
    }
  }
  throw new Error("Failed to generate content after retries");
};

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

    // Construct Data URI
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const text = await generateContentWithRetry(prompt, dataUri);
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
  // Adapt history format for Puter if needed, but basic chat can just be the message + context.
  // Puter doesn't explicitly document a history object in the simple chat() example.
  // However, we can construct a prompt with history or just send the new message if we want to keep it simple.
  // For better context, let's append history to the prompt text.

  const historyText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');
  const fullPrompt = `
     System: You are AstraX, a helpful, encouraging career mentor for a B.Tech student. Keep answers concise, actionable, and encouraging. Focus on tech careers, internships, and skill building. ALWAYS SPEAK IN ENGLISH.
     
     Conversation History:
     ${historyText}
     
     User: ${message}
     Model:
   `;

  // Using the retry wrapper
  return await generateContentWithRetry(fullPrompt);
};

// --- New Resume Generation Service ---
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