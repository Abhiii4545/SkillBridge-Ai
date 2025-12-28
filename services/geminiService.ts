import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Remove top-level worker assignment to prevent startup crashes
// Worker will be initialized lazily inside extractTextFromPdf

import { Internship, UserProfile, LearningRoadmap, ResumeData } from "../types";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");

const API_URL = 'https://text.pollinations.ai/';

// --- Helper: Extract Text from PDF Base64 ---
const extractTextFromPdf = async (base64Data: string): Promise<string> => {
    // Lazy Initialize Worker (prevents "Illegal constructor" crashes on app load)
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }

    try {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;

        // PARALLEL PAGE PROCESSING (Speed Boost)
        const pagePromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            pagePromises.push(pdf.getPage(i).then(page => page.getTextContent()));
        }

        const pageContents = await Promise.all(pagePromises);
        return pageContents.map(content =>
            content.items.map((item: any) => item.str).join('\n')
        ).join('\n\n');

    } catch (error) {
        console.error("PDF Extraction Failed:", error);
        return atob(base64Data);
    }
};

const callAI = async (systemPrompt: string, userPrompt: string, retries = 3): Promise<string> => {
    try {
        // Use Gemini Flash for speed and intelligence
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        return response.text();
    } catch (err) {
        console.error("Gemini API Error:", err);
        // Fallback to Pollinations if Gemini fails (e.g. key missing)
        try {
            console.log("Falling back to Pollinations.ai...");
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    model: 'openai',
                    jsonMode: true
                })
            });
            if (!response.ok) throw new Error("Pollinations Error");
            return await response.text();
        } catch (fallbackErr) {
            console.error("All AI services failed", fallbackErr);
            throw new Error("AI Service unavailable.");
        }
    }
};

// --- Exported Functions ---

// --- Helper: Robust JSON Extractor ---
const extractJSON = (text: string): any => {
    try {
        // 1. Try direct parse
        return JSON.parse(text);
    } catch (e) {
        // 2. Find first curly brace and last curly brace
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            try {
                return JSON.parse(text.substring(start, end + 1));
            } catch (e2) {
                console.error("JSON Extraction Failed:", e2);
            }
        }
        throw new Error("No valid JSON found in response");
    }
};

export const analyzeResume = async (base64Data: string, mimeType: string = 'application/pdf'): Promise<UserProfile> => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        email: { type: SchemaType.STRING },
                        university: { type: SchemaType.STRING },
                        skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        missingSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        summary: { type: SchemaType.STRING },
                        experienceLevel: { type: SchemaType.STRING }
                    }
                }
            }
        });

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

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            prompt
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up any markdown syntax if present (though JSON mode usually prevents this)
        const cleanText = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        return {
            ...parsed,
            // Ensure compatibility with UserProfile interface
            role: 'student', // Default role
            phone: parsed.phone || "", // Add missing phone if not extracted
            resumeUrl: "" // Will be set by upload logic
        } as UserProfile;

    } catch (error) {
        console.error("Error analyzing resume:", error);
        // Fallback to text extraction if inlineData fails (e.g. file too large or type not supported)
        try {
            console.warn("Falling back to text-based analysis...");
            const resumeText = await extractTextFromPdf(base64Data);
            const systemPrompt = `Extract data from resume. Return JSON.`;
            const userPrompt = `RESUME TEXT: ${resumeText.substring(0, 10000)}`;
            const fallbackText = await callAI(systemPrompt, userPrompt);
            return extractJSON(fallbackText);
        } catch (fallbackError) {
            throw error;
        }
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
