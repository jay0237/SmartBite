const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Build the system prompt with live menu data injected.
 */
const buildSystemPrompt = (menuItems) => {
    const menuText = menuItems
        .map((p) => `- ${p.title} | Category: ${p.category} | Price: ₹${p.price} | ${p.desc}`)
        .join("\n");

    return `You are Bitey, a friendly AI food assistant for Smart Bite — an Indian food delivery platform.

SMART BITE MENU:
${menuText}

YOUR RULES:
1. You ONLY recommend food from the Smart Bite menu above. Never suggest items not on the menu.
2. Be friendly, casual, and fun — like a food buddy texting a friend.
3. Keep responses short (3–5 lines max). No long paragraphs.
4. Suggest 2–3 specific items from the menu based on the user's mood, craving, or time of day.
5. Always include the item name and price (e.g. "Classic Cheeseburger — ₹15").
6. If the user asks to add something to cart, reply with exactly: ADD_TO_CART:<item title> (this is a special command).
7. Use 1–2 emojis to feel human. Do NOT use markdown headers or bullet points with dashes — use plain text.
8. If the user's message is vague, ask one short follow-up question.
9. Never say you are an AI or mention Gemini.
10. Context: India-based users, prices in ₹, popular items are burgers, pizza, sushi.`;
};

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot and get a response
 */
exports.sendMessage = async (req, res) => {
    try {
        const { history, menuItems } = req.body;

        if (!history || !Array.isArray(history)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: history array is required",
            });
        }

        if (!menuItems || !Array.isArray(menuItems)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: menuItems array is required",
            });
        }

        if (!GEMINI_API_KEY) {
            console.error("Gemini API key is not configured");
            return res.status(500).json({
                success: false,
                message: "Chatbot service is not configured",
            });
        }

        const systemPrompt = buildSystemPrompt(menuItems);

        // Gemini uses "contents" array with roles "user" and "model"
        const contents = history.map((msg) => ({
            role: msg.role === "bot" ? "model" : "user",
            parts: [{ text: msg.text }],
        }));

        const body = {
            contents,
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 300,
            },
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
        };

        const response = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error("Gemini API error:", error);
            return res.status(response.status).json({
                success: false,
                message: error?.error?.message || `Gemini API error ${response.status}`,
            });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
            return res.status(500).json({
                success: false,
                message: "No response from Gemini API",
            });
        }

        res.json({
            success: true,
            message: text.trim(),
        });
    } catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Chatbot service error",
        });
    }
};
