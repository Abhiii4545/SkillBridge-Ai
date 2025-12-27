
import * as pdfjsLib from 'pdfjs-dist';
// Standard worker setup for client-side PDF parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

// Puter.js is loaded globally via <script> tag
// Default model: User requested free powerful models.
const MODEL_NAME = 'gemini-2.0-flash';

console.log("Using Puter.js with model:", MODEL_NAME);

// --- Helper: Extract Text from PDF Base64 ---
const extractTextFromPdf = async (base64Data: string): Promise<string> => {
    try {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    } catch (error) {
        console.error("PDF Extraction Failed:", error);
        // Fallback: Return raw string if it's just text
        return atob(base64Data);
    }
};

const callPuterAI = async (prompt: string, retries = 3): Promise<string> => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            // Puter.js API call
            // Docs: puter.ai.chat(prompt, options)
            const response = await puter.ai.chat(prompt, {
                model: MODEL_NAME
            });

            // Puter returns the text response directly or an object. 
            // Usually response is the string content.
            if (typeof response === 'object' && response?.message?.content) {
                return response.message.content;
            }
            return response.toString();

        } catch (err) {
            console.error(`Puter AI Error (Attempt ${attempt + 1}):`, err);
            attempt++;
            if (attempt >= retries) throw err;
            await new Promise(r => setTimeout(r, 2000)); // Simple wait
        }
    }
    throw new Error("Puter AI failed to respond.");
};

// --- Exported Functions ---

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
    const resumeText = await extractTextFromPdf(base64Data);

    const prompt = `
  You are an expert career consultant. Analyze the following resume text.
  
  RESUME CONTENT:
  ${resumeText.substring(0, 20000)}

  CRITICAL: Return VALID JSON ONLY. No markdown formatting.
  
  JSON Structure:
  {
    "name": "string",
    "email": "string",
    "university": "string",
    "skills": ["string"],
    "missingSkills": ["string"],
    "summary": "string",
    "experienceLevel": "string"
  }
  
  Identify 3 missing skills for a generic tech role in Hyderabad.
  `;

    const responseText = await callPuterAI(prompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as UserProfile;
};

export const matchInternships = async (profile: UserProfile, internships: Internship[]): Promise<Internship[]> => {
    const internshipBriefs = internships.map(i => ({
        id: i.id,
        title: i.title,
        company: i.company,
        requiredSkills: i.requiredSkills,
        description: i.description
    }));

    const prompt = `
    Student Profile: Skills [${profile.skills.join(', ')}], Summary: ${profile.summary}.
    
    Internships: ${JSON.stringify(internshipBriefs)}
    
    Rank these internships by relevance to the student.
    
    OUTPUT: VALID JSON ARRAY of objects.
    Example: [{"id": "1", "matchScore": 90, "matchReason": "Fit"}]
    `;

    const responseText = await callPuterAI(prompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const rankings = JSON.parse(cleanText);

    return internships.map(internship => {
        const rank = rankings.find((r: any) => r.id === internship.id);
        return {
            ...internship,
            matchScore: rank?.matchScore || 0,
            matchReason: rank?.matchReason || "Pending analysis..."
        };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

export const generateCareerPath = async (profile: UserProfile, targetRole: string, targetCompany: string): Promise<LearningRoadmap> => {
    const prompt = `
       Profile Skills: ${profile.skills.join(', ')}.
       Experience: ${profile.experienceLevel}.
       Target: ${targetRole} at ${targetCompany}.

       Generate a Career Roadmap in VALID JSON format.
       
       Structure:
       {
           "readinessScore": 0,
           "strongSkills": [{"skill": "", "reason": ""}],
           "skillsToImprove": [{"skill": "", "reason": ""}],
           "skillsToLearn": [{"skill": "", "reason": ""}],
           "roadmap": [{"month": "", "skills": [], "tools": [], "task": ""}],
           "recommendedProjects": [{"name": "", "skillsCovered": [], "reason": ""}],
           "profileSuggestions": [],
           "nextImmediateStep": ""
       }`;

    const responseText = await callPuterAI(prompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as LearningRoadmap;
};

export const getChatResponse = async (history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> => {
    // Puter is stateless (or handles it differently), simplest way is to send the conversation history as context or just the last message if keeping it simple.
    // For robust chat, we prepend history to the prompt.

    let context = history.map(h => `${h.role === 'user' ? 'User' : 'AI'}: ${h.parts[0].text}`).join('\n');
    const prompt = `${context}\nUser: ${message}\nAI:`;

    return await callPuterAI(prompt);
};

export const generateATSResume = async (currentData: Partial<ResumeData>): Promise<ResumeData> => {
    const prompt = `
       Act as an expert ATS Resume Writer.
       Raw Data: ${JSON.stringify(currentData)}
       
       Refine the data into a professional JSON structure matching the ResumeData interface.
       Improve descriptions using STAR method.
       
       OUTPUT: VALID JSON ONLY.
    `;
    const responseText = await callPuterAI(prompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as ResumeData;
};
