
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
// Set the worker source for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
    console.error("Missing VITE_OPENAI_API_KEY in environment variables");
}

const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

const MODEL_NAME = 'gpt-4o-mini'; // Cost-effective and capable

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
        throw new Error("Failed to read PDF content. Please try uploading a text file or image.");
    }
};

const generateJSON = async (systemPrompt: string, userPrompt: string): Promise<any> => {
    try {
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content returned from OpenAI");
        return JSON.parse(content);
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
}

// --- Exported Functions matching geminiService signatures ---

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
    // If PDF, need to extract text first because OpenAI Chat API doesn't accept PDF files directly
    let resumeText = "";
    if (mimeType.includes('pdf')) {
        resumeText = await extractTextFromPdf(base64Data);
    } else {
        // Fallback for plain text or assume text-readable if not PDF (could expand for images later)
        resumeText = atob(base64Data);
    }

    const systemPrompt = `You are an expert career consultant. Analyze the candidate's resume text and extraction actionable data.
  CRITICAL: Return JSON only. No markdown formatting.
  
  JSON Schema:
  {
    "name": "string",
    "email": "string",
    "university": "string",
    "skills": ["string"],
    "missingSkills": ["string"],
    "summary": "string",
    "experienceLevel": "string"
  }`;

    const userPrompt = `Here is the resume content:\n\n${resumeText.substring(0, 15000)}\n\nIdentify 3 missing skills for a generic tech role in Hyderabad.`;

    return generateJSON(systemPrompt, userPrompt) as UserProfile;
};

export const matchInternships = async (profile: UserProfile, internships: Internship[]): Promise<Internship[]> => {
    const internshipBriefs = internships.map(i => ({
        id: i.id,
        title: i.title,
        company: i.company,
        requiredSkills: i.requiredSkills,
        description: i.description
    }));

    const systemPrompt = `Rank the provided internships based on the student's profile.
    Response must be a JSON object containing a property "rankings" which is an array.
    Example: { "rankings": [{"id": "1", "matchScore": 90, "matchReason": "Fit"}] }`;

    const userPrompt = `Student Profile: Skills [${profile.skills.join(', ')}], Summary: ${profile.summary}.
    
    Internships: ${JSON.stringify(internshipBriefs)}
    
    Rank them and provide matchScore (0-100) and matchReason.`;

    const response = await generateJSON(systemPrompt, userPrompt);
    const rankings = response.rankings || response; // Handle if AI returns array directly or wrapped

    // Merge rankings
    return internships.map(internship => {
        // Handle array vs wrapped object
        const rankList = Array.isArray(rankings) ? rankings : [];
        const rank = rankList.find((r: any) => r.id === internship.id);
        return {
            ...internship,
            matchScore: rank?.matchScore || 0,
            matchReason: rank?.matchReason || "Pending analysis..."
        };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

export const generateCareerPath = async (profile: UserProfile, targetRole: string, targetCompany: string): Promise<LearningRoadmap> => {
    const systemPrompt = `Generate a detailed Career Roadmap JSON.`;
    const userPrompt = `
       Profile Skills: ${profile.skills.join(', ')}.
       Experience: ${profile.experienceLevel}.
       Target: ${targetRole} at ${targetCompany}.

       Format:
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

    return generateJSON(systemPrompt, userPrompt) as LearningRoadmap;
};

export const getChatResponse = async (history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> => {
    // Convert Gemini history format to OpenAI messages
    const messages = history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts[0].text
    }));

    // Add new user message
    messages.push({ role: 'user', content: message } as any);

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: messages as any
        });
        return completion.choices[0].message.content || "I didn't get a response.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "I'm having trouble connecting to OpenAI right now.";
    }
};

export const generateATSResume = async (currentData: Partial<ResumeData>): Promise<ResumeData> => {
    const systemPrompt = `You are an expert ATS Resume Writer. Polish the data into a JSON structure matching Strict Resume Data interface.`;
    const userPrompt = `
       Raw Data: ${JSON.stringify(currentData)}
       
       Tasks:
       1. Write compelling summary.
       2. Use STAR method for projects.
       3. Quantify experience.
       4. Return JSON matching ResumeData interface.
    `;
    return generateJSON(systemPrompt, userPrompt) as ResumeData;
};
