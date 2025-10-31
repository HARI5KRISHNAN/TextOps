import { GoogleGenAI } from '@google/genai';

// FIX: Removed explicit Request and Response types to allow for correct type inference from Express router.
export const generateSummary = async (req, res) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required.' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ message: 'API_KEY is not configured on the server.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Provide a concise summary of the following meeting transcript. Use bullet points for key decisions and action items. Make sure to identify action items clearly with "**Action Item:**":\n\n${transcript}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const summary = response.text;
        
        if (!summary) {
            throw new Error('The AI returned an empty summary.');
        }
        
        res.status(200).json({ summary });

    } catch (error) {
        console.error('Error contacting Gemini API:', error);
        res.status(500).json({ message: 'Failed to generate summary from AI service.' });
    }
};