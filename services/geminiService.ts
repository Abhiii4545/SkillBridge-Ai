
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

// --- Exported Functions ---

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
    const resumeText = await extractTextFromPdf(base64Data);

    // SPEED OPTIMIZATION: Regex Fallbacks for instant, accurate contact info
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const phoneRegex = /(\+?\d{1,3}[-.]?)?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

    const emailMatch = resumeText.match(emailRegex);
    const phoneMatch = resumeText.match(phoneRegex);

    const fallbackEmail = emailMatch ? emailMatch[0] : "";
    const fallbackPhone = phoneMatch ? phoneMatch[0] : "";

    const systemPrompt = `You are a fast API. Extract resume data. Return JSON only.`;
    const userPrompt = `
  RESUME TEXT:
  ${resumeText.substring(0, 15000)}

  INSTRUCTIONS:
  Extract structured data. Use inference for missing fields.
  JSON Format:
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "university": "string",
    "skills": ["skill1", "skill2"],
    "missingSkills": ["ms1", "ms2", "ms3"],
    "summary": "3 sentence summary",
    "experienceLevel": "Student/Entry/Experienced"
  }
  
  Critical: Identify 3 missing skills for a 'Full Stack Developer' role.
  `;

    const responseText = await callAI(systemPrompt, userPrompt);
    const cleanText = responseText.replace(/```json|```/g, '').trim();

    try {
        const parsed = JSON.parse(cleanText) as UserProfile;
        // Merge Regex results for 100% accuracy on contact info
        return {
            ...parsed,
            email: parsed.email || fallbackEmail,
            // We store phone in summary or custom field if needed, but here we prioritize email accuracy
        };
    } catch (e) {
        console.warn("AI Parsing Failed, returning partial data via Regex");
        return {
            name: "Candidate",
            email: fallbackEmail,
            university: "",
            skills: [],
            missingSkills: [],
            summary: "Could not parse resume completely.",
            experienceLevel: "Entry Level",
            role: "student"
        };
    }
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
