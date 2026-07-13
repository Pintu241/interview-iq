import axios from "axios"

export const askAi = async (messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }

        // 1. Check if Gemini API key is configured
        if (process.env.GEMINI_API_KEY) {
            console.log("Using Gemini API for request...");
            const systemMessage = messages.find(m => m.role === "system")?.content || "";
            const userMessages = messages
                .filter(m => m.role !== "system")
                .map(m => {
                    const role = m.role === "assistant" ? "model" : "user";
                    return {
                        role: role,
                        parts: [{ text: m.content }]
                    };
                });

            // Using Gemini 2.5 Flash via REST API
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            
            const response = await axios.post(url, {
                contents: userMessages,
                systemInstruction: {
                    parts: [{ text: systemMessage }]
                }
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const content = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content || !content.trim()) {
                throw new Error("Gemini API returned an empty response.");
            }
            return content;
        }

        // 2. Fallback to OpenRouter if configured
        if (process.env.OPENROUTER_API_KEY) {
            console.log("Using OpenRouter API for request...");
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "openai/gpt-4o-mini",
                    messages: messages
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const content = response?.data?.choices?.[0]?.message?.content;
            if (!content || !content.trim()) {
                throw new Error("OpenRouter AI returned empty response.");
            }
            return content;
        }

        throw new Error("Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is defined in environment variables.");

    } catch (error) {
        console.error("AI Service Error:", error.response?.data || error.message);
        throw new Error(`AI API Error: ${error.response?.data?.error?.message || error.message}`);
    }
}