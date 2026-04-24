const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const CHATBOT_API = `${API_URL}/chatbot/message`;

/**
 * Call Chatbot API with conversation history.
 * @param {Array} history  - [{role: "user"|"bot", text: string}]
 * @param {Array} menuItems
 * @returns {Promise<string>}
 */
export const getGeminiResponse = async (history, menuItems) => {
    try {
        const res = await fetch(CHATBOT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history: history.map((msg) => ({
                    role: msg.role,
                    text: msg.text,
                })),
                menuItems,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("Chatbot API Error:", err);
            throw new Error(err?.message || `Chatbot API error ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Chatbot API returned an error");
        }

        const text = data.message || "";

        if (!text) {
            throw new Error("No response text from Chatbot API");
        }

        return text.trim();
    } catch (error) {
        console.error("Chatbot API call failed:", error);
        throw error;
    }
};

export const QUICK_REPLIES = [
    "I'm feeling hungry ",
    "Something light",
    "Best sellers ",
    "Surprise me ",
    "Show full menu",
];
