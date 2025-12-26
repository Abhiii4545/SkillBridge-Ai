import { GoogleGenAI, Type } from "@google/genai";
import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
  try {
    const prompt = `
      You are an expert career consultant for B.Tech students.
      Analyze the provided resume document.
      
      CRITICAL: OUTPUT ENGLISH ONLY.
      
      Extract:
      - Name, Email
      - University
      - Skills (Array of strings)
      - Summary
      - Experience Level
      - Identify 3 missing skills for a generic tech role in Hyderabad.
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

    const text = response.text || "{}";
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
      
      OUTPUT: ENGLISH ONLY.
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

    const text = response.text || '[]';
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
    return internships.map(i => ({...i, matchScore: 50, matchReason: "Basic match logic applied."}));
  }
};

export const generateCareerPath = async (profile: UserProfile, targetRole: string, targetCompany: string): Promise<LearningRoadmap> => {
    const prompt = `
      Profile Skills: ${profile.skills.join(', ')}.
      Experience: ${profile.experienceLevel}.
      Target: ${targetRole} at ${targetCompany}.

      Generate a Career Roadmap.
      
      CRITICAL: OUTPUT MUST BE ENGLISH ONLY.
      
      Required Fields in JSON:
      - readinessScore (0-100)
      - strongSkills (Array of {skill, reason})
      - skillsToImprove (Array of {skill, reason})
      - skillsToLearn (Array of {skill, reason})
      - roadmap (Array of {month, skills (array), tools (array), task})
      - recommendedProjects (Array of {name, skillsCovered (array), reason})
      - profileSuggestions (Array of strings)
      - nextImmediateStep (String)
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    readinessScore: { type: Type.NUMBER },
                    strongSkills: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { skill: { type: Type.STRING }, reason: { type: Type.STRING } } } },
                    skillsToImprove: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { skill: { type: Type.STRING }, reason: { type: Type.STRING } } } },
                    skillsToLearn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { skill: { type: Type.STRING }, reason: { type: Type.STRING } } } },
                    roadmap: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: { type: Type.STRING }, skills: { type: Type.ARRAY, items: { type: Type.STRING } }, tools: { type: Type.ARRAY, items: { type: Type.STRING } }, task: { type: Type.STRING } } } },
                    recommendedProjects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, skillsCovered: { type: Type.ARRAY, items: { type: Type.STRING } }, reason: { type: Type.STRING } } } },
                    profileSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    nextImmediateStep: { type: Type.STRING }
                }
            }
        }
    });

    const text = response.text || '{}';
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as LearningRoadmap;
};

export const getChatResponse = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    const chat = ai.chats.create({
        model: MODEL_NAME,
        history: history,
        config: {
            systemInstruction: "You are AstraX, a helpful, encouraging career mentor for a B.Tech student. Keep answers concise, actionable, and encouraging. Focus on tech careers, internships, and skill building. ALWAYS SPEAK IN ENGLISH."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't generate a response.";
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
      
      CRITICAL: Output valid JSON only. English Language.
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    fullName: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    linkedin: { type: Type.STRING },
                    github: { type: Type.STRING },
                    education: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                id: { type: Type.STRING }, 
                                institution: { type: Type.STRING }, 
                                degree: { type: Type.STRING }, 
                                year: { type: Type.STRING }, 
                                gpa: { type: Type.STRING } 
                            } 
                        } 
                    },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    projects: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                id: { type: Type.STRING }, 
                                title: { type: Type.STRING }, 
                                techStack: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                                description: { type: Type.STRING } 
                            } 
                        } 
                    },
                    experience: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { 
                                id: { type: Type.STRING }, 
                                company: { type: Type.STRING }, 
                                role: { type: Type.STRING }, 
                                duration: { type: Type.STRING }, 
                                description: { type: Type.STRING } 
                            } 
                        } 
                    },
                    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING }
                }
            }
        }
    });

    const text = response.text || '{}';
    return JSON.parse(text) as ResumeData;
};