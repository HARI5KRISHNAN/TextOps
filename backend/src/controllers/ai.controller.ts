// The URL for the self-hosted Ollama AI engine container.
const OLLAMA_API_URL = 'http://ai-engine:11434/api/generate';

// FIX: Removed explicit Request and Response types to allow for correct type inference from Express router.
export const generateSummary = async (req, res) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({ message: 'Transcript is required.' });
    }

    try {
        const prompt = `Provide a concise summary of the following meeting transcript. Use bullet points for key decisions and action items:\n\n${transcript}`;

        // NOTE: This uses the native `fetch` API, available in Node.js v18+.
        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'phi-3-mini', // The model we downloaded in the Dockerfile
                prompt: prompt,
                stream: false, // We want the full response at once
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API responded with status ${response.status}`);
        }

        const data = await response.json();
        
        res.status(200).json({ summary: data.response });

    } catch (error) {
        console.error('Error contacting Ollama AI Engine:', error);
        res.status(500).json({ message: 'Failed to generate summary from AI engine.' });
    }
};