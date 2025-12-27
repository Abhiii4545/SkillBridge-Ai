
import * as pdfjsLib from 'pdfjs-dist';
// Standard worker setup for client-side PDF parsing
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

// Pollinations.ai: Free, No Key, No Login
const API_URL = 'https://text.pollinations.ai/';

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
            // Join with newlines to preserve vertical structure
            const pageText = textContent.items.map((item: any) => item.str).join('\n');
            fullText += pageText + '\n\n';
        }
        return fullText;
    } catch (error) {
        console.error("PDF Extraction Failed:", error);
        return atob(base64Data);
    }
};

const callAI = async (systemPrompt: string, userPrompt: string, retries = 3): Promise<string> => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    model: 'openai', // Pollinations mapping
                    jsonMode: true // Hint for JSON
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.text();

        } catch (err) {
            console.error(`AI API Error (Attempt ${attempt + 1}):`, err);
            attempt++;
            if (attempt >= retries) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw new Error("AI Service failed to respond.");
};

// --- Exported Functions ---

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
    const resumeText = await extractTextFromPdf(base64Data);

    const systemPrompt = `You are an expert career consultant. return VALID JSON ONLY. No markdown.`;
    const userPrompt = `
  Analyze this resume text:
  ${resumeText.substring(0, 25000)}

  Extract structured data.
  JSON Structure:
  {
    "name": "string",
    "email": "string",
    "university": "string",
    "skills": ["string", "string"],
    "missingSkills": ["string", "string", "string"],
    "summary": "string",
    "experienceLevel": "string"
  }
  
  For missingSkills, identify 3 critical skills for a Full Stack Developer role that are missing from the resume.
  `;

    const responseText = await callAI(systemPrompt, userPrompt);
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

    const systemPrompt = "Rank internships based on student profile. Return VALID JSON Array.";
    const userPrompt = `
    Student Profile: Skills [${profile.skills.join(', ')}], Summary: ${profile.summary}.
    Internships: ${JSON.stringify(internshipBriefs)}
    
    Rank them. Output JSON Array: [{"id": "1", "matchScore": 90, "matchReason": "Fit"}]
    `;

    const responseText = await callAI(systemPrompt, userPrompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const rankings = JSON.parse(cleanText);

    return internships.map(internship => {
        const rank = Array.isArray(rankings) ? rankings.find((r: any) => r.id === internship.id) : null;
        return {
            ...internship,
            matchScore: rank?.matchScore || 0,
            matchReason: rank?.matchReason || "Pending analysis..."
        };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

export const generateCareerPath = async (profile: UserProfile, targetRole: string, targetCompany: string): Promise<LearningRoadmap> => {
    const systemPrompt = "Generate a Career Roadmap in VALID JSON format. No markdown.";
    const userPrompt = `
       Profile: ${profile.skills.join(', ')}. Target: ${targetRole} at ${targetCompany}.
       
       JSON Structure:
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

    const responseText = await callAI(systemPrompt, userPrompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as LearningRoadmap;
};

export const getChatResponse = async (history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> => {
    // Convert to OpenAI format
    const messages = history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts[0].text
    }));
    messages.push({ role: 'user', content: message });

    // Direct call for chat
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a helpful career assistant.' },
                    ...messages
                ],
                model: 'openai'
            })
        });
        return await response.text();
    } catch (e) {
        return "Sorry, I am having trouble connecting.";
    }
};

export const generateATSResume = async (currentData: Partial<ResumeData>): Promise<ResumeData> => {
    const systemPrompt = "Act as an expert ATS Resume Writer. Return VALID JSON.";
    const userPrompt = `
       Raw Data: ${JSON.stringify(currentData)}
       Refine this into a professional structure matching ResumeData interface.
       Use STAR method for projects.
    `;
    const responseText = await callAI(systemPrompt, userPrompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText) as ResumeData;
};
