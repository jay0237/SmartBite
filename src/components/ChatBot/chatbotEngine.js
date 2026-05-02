// ─────────────────────────────────────────────────────────────
//  Chatbot Engine — Smart rule-based AI for Smart Bite
//  Returns { text, chips, products } where products are
//  clickable food cards rendered inside the chat bubble.
// ─────────────────────────────────────────────────────────────

export const QUICK_REPLIES = [
    "I'm feeling hungry 🍔",
    "Something light 🥗",
    "Best sellers ⭐",
    "Surprise me 🎲",
    "Show full menu 📋",
];

// ── Rule-based response engine ────────────────────────────────
const getRuleBasedReply = (userText, menuItems) => {
    const msg = userText.toLowerCase().trim();

    const byCategory = (cat) => menuItems.filter((p) => p.category === cat);

    // Helper: build reply with product cards
    const withProducts = (text, items, chips = []) => ({
        text,
        products: items.slice(0, 3),
        chips: chips.length ? chips : QUICK_REPLIES,
    });

    // Greetings
    if (/^(hi|hello|hey|hii|helo|sup|yo)\b/.test(msg)) {
        return {
            text: "Hey there! 👋 I'm Bitey, your Smart Bite food buddy!\n\nWhat are you craving today?",
            products: [],
            chips: QUICK_REPLIES,
        };
    }

    // Thanks / bye
    if (/thank|bye|done|great|awesome|perfect/.test(msg)) {
        return {
            text: "You're welcome! 😊 Enjoy your meal! Come back anytime you're hungry. 🍕",
            products: [],
            chips: ["Order more food 🍔", "Show full menu 📋"],
        };
    }

    // Add to cart intent
    if (/^add\s/.test(msg) || (msg.includes("add") && msg.includes("cart"))) {
        const found = menuItems.find((p) =>
            msg.includes(p.title.toLowerCase())
        );
        if (found) return { text: `ADD_TO_CART:${found.title}`, products: [], chips: [] };
        return {
            text: "Which item would you like to add? Pick one below! 😊",
            products: menuItems.slice(0, 3),
            chips: ["Show full menu 📋"],
        };
    }

    // Burger
    if (/burger|beef|bbq/.test(msg)) {
        return withProducts("Burger time! 🍔 Here's what we've got — tap to add to cart:", byCategory("Burger"));
    }

    // Pizza
    if (/pizza|margherita|tikka/.test(msg)) {
        return withProducts("Pizza lover! 🍕 Check these out:", byCategory("Pizza"));
    }

    // Sushi
    if (/sushi|japanese|roll|nigiri/.test(msg)) {
        return withProducts("Sushi fan! 🍣 Fresh picks:", byCategory("Sushi"));
    }

    // Drinks
    if (/drink|juice|coffee|smoothie|lemonade|thirsty/.test(msg)) {
        return withProducts("Refreshing picks! 🥤", byCategory("Drinks"));
    }

    // Snacks / light
    if (/snack|light|quick|nachos|wrap|garlic/.test(msg)) {
        return withProducts("Something light? 😊", byCategory("Snacks"));
    }

    // Desserts
    if (/sweet|dessert|cake|cheesecake|chocolate/.test(msg)) {
        return withProducts("Sweet tooth! 🍰", byCategory("Desserts"));
    }

    // Hungry / heavy
    if (/hungry|starving|heavy|filling|meal/.test(msg)) {
        const picks = [...byCategory("Burger").slice(0, 2), ...byCategory("Pizza").slice(0, 1)];
        return withProducts("You're hungry? Let's fix that! 😋", picks);
    }

    // Best sellers / popular
    if (/best|popular|recommend|top|famous/.test(msg)) {
        return withProducts("Our top picks right now! ⭐", menuItems.slice(0, 3));
    }

    // Surprise / random
    if (/surprise|random|anything|whatever|idk/.test(msg)) {
        const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
        return withProducts("Feeling adventurous? 🎲 How about these:", shuffled.slice(0, 3));
    }

    // Full menu
    if (/menu|all|list|show|what.*have|what.*got/.test(msg)) {
        return withProducts("Here's a taste of our menu! 🍽️", menuItems.slice(0, 3), ["Burgers 🍔", "Pizza 🍕", "Sushi 🍣", "Drinks 🥤"]);
    }

    // Price / cheap / budget
    if (/cheap|budget|affordable|price|cost|under/.test(msg)) {
        const cheap = [...menuItems].sort((a, b) => a.price - b.price).slice(0, 3);
        return withProducts("Best value picks! 💰", cheap);
    }

    // Default fallback
    const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
    return withProducts(
        "Hmm, tell me more about what you're craving! 🤔\n\nMeanwhile, here are some popular picks:",
        shuffled.slice(0, 3),
        QUICK_REPLIES
    );
};

// ── Main export ───────────────────────────────────────────────
export const getGeminiResponse = async (history, menuItems) => {
    const lastUserMsg =
        [...history].reverse().find((m) => m.role === "user")?.text || "";

    // Try backend Gemini first
    try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
        const res = await fetch(`${API_URL}/chatbot/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ history, menuItems }),
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.message) return data.message.trim();
        }
    } catch {
        // Backend unavailable — use local engine
    }

    // Local rule-based fallback
    const { text } = getRuleBasedReply(lastUserMsg, menuItems);
    return text;
};

// ── Used directly by ChatBot for full reply with products ─────
export const getLocalReply = (userText, menuItems) =>
    getRuleBasedReply(userText, menuItems);
