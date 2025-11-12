
import { GoogleGenAI, Type } from "@google/genai";
import type { SoapNote, Prescription } from "../types";

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

const documentAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        documentType: {
            type: Type.STRING,
            enum: ['SOAP Note', 'Prescription', 'Radiography Report', 'Lab Result', 'Other'],
            description: "The identified type of the veterinary document."
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one or two-sentence summary of the document's key findings or purpose."
        },
        date: {
            type: Type.STRING,
            description: "The primary date found on the document, formatted as YYYY-MM-DD. If no date is found, return null."
        },
        details: {
            type: Type.OBJECT,
            description: "Structured data specific to the document type. For 'SOAP Note', this will be a SoapNote object. For 'Prescription', it will be an array of Prescription objects.",
            properties: {
                 // Properties for SOAP Note
                subjective: { type: Type.STRING },
                objective: { type: Type.STRING },
                assessment: { type: Type.STRING },
                plan: { type: Type.STRING },
                // Properties for Prescription
                medications: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            medication: { type: Type.STRING },
                            dosage: { type: Type.STRING },
                            frequency: { type: Type.STRING },
                        }
                    }
                }
            }
        }
    },
    required: ["documentType", "summary", "date", "details"],
}

export const analyzeDocument = async (file: { mimeType: string, data: string }): Promise<any> => {
    try {
        const prompt = `Analyze the following veterinary document. Identify its type from the list: 'SOAP Note', 'Prescription', 'Radiography Report', 'Lab Result', 'Other'. Extract a concise summary and the document's date. Based on the type, extract specific details. If it's a SOAP Note, extract the S, O, A, and P sections. If it's a prescription, extract each medication, its dosage, and frequency. Format the entire output as JSON using the provided schema.`;

        const imagePart = {
            inlineData: {
                mimeType: file.mimeType,
                data: file.data,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: documentAnalysisSchema,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error analyzing document with Gemini:", error);
        throw new Error("Failed to analyze the document. The file might be unreadable or in an unsupported format.");
    }
}