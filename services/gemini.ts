import { GoogleGenAI, Type } from "@google/genai";
import { Resume, Job } from "../types";

// Note: For image generation/heavy tasks, we instantiate locally to ensure fresh keys if managed externally.
// For simpler tasks, we can use a shared instance or re-instantiate.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Phase 1 Features ---

export const generateCoverLetter = async (
  role: string,
  company: string,
  userSkills: string
): Promise<string> => {
  try {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a passionate, professional cover letter for the ${role} position at ${company}. 
    Emphasize the following skills: ${userSkills}. 
    Keep it concise (under 300 words) and ready to copy-paste.`;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate cover letter.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return "Error: Unable to generate content. Please check your API key and try again.";
  }
};

export const generateInterviewGuide = async (
  role: string,
  company: string,
  description: string
): Promise<string> => {
  try {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a comprehensive interview preparation guide for a ${role} position at ${company}. 
    Based on the job description provided below, suggest 5 likely technical questions, 3 behavioral questions, and key tips for success.
    
    Job Description:
    ${description}
    
    Format the output in Markdown.`;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate interview guide.";
  } catch (error) {
    console.error("Error generating interview guide:", error);
    return "Error: Unable to generate content.";
  }
};

// --- Phase 2 Features ---

export const parseResumeImage = async (base64Image: string): Promise<Partial<Resume>> => {
  try {
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze this resume image. Extract structured data into JSON matching the schema provided. 
    Ensure the 'experience' and 'education' arrays follow the structure with title (role/degree), subtitle (company/school), date, and content (description).
    Improve the wording of the summary and descriptions to be more action-oriented and professional if possible.`;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            title: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            summary: { type: Type.STRING },
            skills: { type: Type.STRING },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  date: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  date: { type: Type.STRING },
                  content: { type: Type.STRING }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tech: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse JSON
    return JSON.parse(text) as Partial<Resume>;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

export const generateProfessionalHeadshot = async (base64Image: string): Promise<string> => {
  return generateStyledAvatar(base64Image, "high-quality professional corporate headshot, studio lighting, neutral professional background, approachable yet confident");
};

export const generateStyledAvatar = async (base64Image: string, stylePrompt: string): Promise<string> => {
  try {
    // Always create a new instance to ensure we pick up any API key changes (e.g. from key selector dialogs)
    const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Transform this image based on the following style description: "${stylePrompt}". 
    Important: Maintain the facial features and identity of the subject exactly. Only change the artistic style, lighting, clothing, or background as requested.`;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        // responseMimeType is not supported for nano banana series models
      }
    });

    // Iterate to find image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error;
  }
};

export const createClaireChat = (jobs: Job[]) => {
  const aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Calculate stats for context
  const total = jobs.length;
  const interviews = jobs.filter(j => j.status === 'Interview').length;
  const offers = jobs.filter(j => j.status === 'Offer' || j.status === 'Accepted').length;
  const conversionRate = total > 0 ? (interviews / total) * 100 : 0;
  
  const systemInstruction = `You are Claire, a friendly, empathetic, and highly intelligent career coach. 
  You are helping a user named Alex with their job search.
  
  Current Job Search Context:
  - Total Applications: ${total}
  - Interviews Secured: ${interviews}
  - Offers Received: ${offers}
  - Interview Conversion Rate: ${conversionRate.toFixed(1)}%

  Guidelines:
  1. If the conversion rate is low (<10%), gently suggest reviewing their resume or cover letter for impact.
  2. If they have upcoming interviews, offer to roleplay common questions.
  3. Be encouraging but practical. Use emojis sparingly to be friendly.
  4. Keep responses concise and conversational.
  `;

  return aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    }
  });
};