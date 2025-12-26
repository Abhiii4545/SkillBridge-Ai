import { GoogleGenAI, Type } from "@google/genai";
import { Internship, UserProfile } from "../types";

// Initialize Gemini Client
// IMPORTANT: Accessing process.env.API_KEY directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
  try {
    const prompt = `
      You are an expert career consultant for B.Tech students in Hyderabad.
      Analyze the provided resume document.
      Extract the following information in JSON format:
      - Name
      - Email
      - University/College Name (if found)
      - List of Skills (technical and soft skills)
      - A short professional summary (2-3 sentences)
      - Experience Level (Student, Junior, Mid-Level)
      
      Also, based on the skills found, identify 3 critical "missing skills" that would make this candidate highly employable in the Hyderabad tech ecosystem (e.g., if they know React, maybe they miss TypeScript or Cloud).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            university: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            experienceLevel: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as UserProfile;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const matchInternships = async (profile: UserProfile, internships: Internship[]): Promise<Internship[]> => {
  try {
    // For a production app, we would process this in smaller batches or use embeddings.
    // For this demo, we'll send the profile summary/skills and the internship list to Gemini to rank.
    
    const internshipBriefs = internships.map(i => ({
      id: i.id,
      title: i.title,
      company: i.company,
      requiredSkills: i.requiredSkills
    }));

    const prompt = `
      I have a student with these skills: ${profile.skills.join(', ')}.
      Summary: ${profile.summary}.
      
      Here is a list of internships: ${JSON.stringify(internshipBriefs)}.
      
      Rank these internships by relevance to the student.
      For each internship, assign a "matchScore" (0-100) and a short one-sentence "matchReason" explaining why it's a good or bad fit.
      
      Return a JSON array of objects containing { id, matchScore, matchReason }.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              matchReason: { type: Type.STRING }
            }
          }
        }
      }
    });

    const rankings = JSON.parse(response.text || '[]') as { id: string, matchScore: number, matchReason: string }[];

    // Merge rankings back into full internship objects
    const rankedInternships = internships.map(internship => {
      const rank = rankings.find(r => r.id === internship.id);
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
    // Fallback: simple text match if API fails
    return internships.map(i => ({...i, matchScore: 50, matchReason: "Basic match logic applied."}));
  }
};

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    const chat = ai.chats.create({
        model: MODEL_NAME,
        history: history,
        config: {
            systemInstruction: "You are SkillBridge, a helpful, encouraging career mentor for a B.Tech student in Hyderabad. Keep answers concise, actionable, and encouraging. Focus on tech careers, internships, and skill building."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't generate a response.";
};
