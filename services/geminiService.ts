
import { GoogleGenAI, Type } from "@google/genai";
import type { SoapNote } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and will be handled by the environment in production.
  console.warn("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const soapNoteSchema = {
    type: Type.OBJECT,
    properties: {
        subjective: {
            type: Type.STRING,
            description: "The owner's observations and complaints about the pet. This is the 'history' of the problem.",
        },
        objective: {
            type: Type.STRING,
            description: "The veterinarian's direct observations and findings from the physical examination, diagnostic tests, and data.",
        },
        assessment: {
            type: Type.STRING,
            description: "The veterinarian's analysis of the subjective and objective information, leading to a diagnosis or a list of possible diagnoses (differentials).",
        },
        plan: {
            type: Type.STRING,
            description: "The course of action, including treatments, further diagnostic tests, medications, and follow-up instructions for the owner.",
        },
    },
    required: ["subjective", "objective", "assessment", "plan"],
};


export const generateSoapNotesFromTranscript = async (transcript: string): Promise<SoapNote> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following veterinary consultation transcript, please generate a structured SOAP note. Extract the relevant information and format it correctly into the Subjective, Objective, Assessment, and Plan sections.\n\nTranscript:\n"""\n${transcript}\n"""`,
            config: {
                responseMimeType: "application/json",
                responseSchema: soapNoteSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation to ensure the response matches the SOAP note structure
        if (
            'subjective' in parsedJson &&
            'objective' in parsedJson &&
            'assessment' in parsedJson &&
            'plan' in parsedJson
        ) {
            return parsedJson as SoapNote;
        } else {
            throw new Error("AI response did not match the expected SOAP note format.");
        }

    } catch (error) {
        console.error("Error generating SOAP notes from Gemini:", error);
        throw new Error("Failed to generate SOAP notes. Please try again.");
    }
};
