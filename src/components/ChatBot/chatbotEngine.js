// ─────────────────────────────────────────────────────────────
//  Chatbot Engine — Smart rule-based AI for Smart Bite
//  Works 100% on the frontend — no backend call needed.
//  Optionally upgrades to Gemini if backend key is configured.
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
    const fmt = (items, n = 3) =>
        items
            .slice(0, n)
            .map((p) => `• ${p.title} — ₹${p.price}`)
            .join("\n");

    // Greetings
    if (/^(hi|hello|hey|hii|helo|sup|yo)\b/.test(msg)) {
        return {
            text: "Hey there! 👋 I'm Bitey, your Smart Bite food buddy!\n\nWhat are you craving today? Burgers, pizza, sushi, or something else? 😋",
            chips: QUICK_REPLIES,
        };
    }

    // Thanks / bye
    if (/thank|bye|done|great|awesome|perfect/.test(msg)) {
        return {
            text: "You're welcome! 😊 Enjoy your meal! Come back anytime you're hungry. 🍕",
            chips: ["Order more food 🍔", "Show full menu 📋"],
        };
    }

    // Add to cart intent
    if (/add|cart|order/.test(msg)) {
        const found = menuItems.find((p) =>
            msg.includes(p.title.toLowerCase())
        );
        if (found) {
            return { text: `ADD_TO_CART:${found.title}`, chips: [] };
        }
        return {
            text: "Which item would you like to add? Just tell me the name! 😊\n\nOr say 'show full menu' to browse.",
            chips: ["Show full menu 📋", "Best sellers ⭐"],
        };
    }

    // Burger
    if (/burger|beef|chicken burger|bbq/.test(msg)) {
        const items = byCategory("Burger");
        return {
            text: `Burger time! 🍔 Here's what we've got:\n\n${fmt(items)}\n\nWant me to add one to your cart?`,
            chips: items.slice(0, 3).map((p) => `Add ${p.title}`),
        };
    }

    // Pizza
    if (/pizza|margherita|tikka|pepperoni/.test(msg)) {
        const items = byCategory("Pizza");
        return {
            text: `Pizza lover! 🍕 Check these out:\n\n${fmt(items)}\n\nWhich one sounds good?`,
            chips: items.slice(0, 3).map((p) => `Add ${p.title}`),
        };
    }

    // Sushi
    if (/sushi|japanese|roll|nigiri/.test(msg)) {
        const items = byCategory("Sushi");
        return {
            text: `Sushi fan! 🍣 Fresh picks:\n\n${fmt(items)}\n\nShall I add one to your cart?`,
            chips: items.slice(0, 2).map((p) => `Add ${p.title}`),
        };
    }

    // Drinks
    if (/drink|juice|coffee|smoothie|lemonade|thirsty/.test(msg)) {
        const items = byCategory("Drinks");
        return {
            text: `Refreshing picks! 🥤\n\n${fmt(items)}\n\nWant one added to your cart?`,
            chips: items.slice(0, 3).map((p) => `Add ${p.title}`),
        };
    }

    // Snacks
    if (/snack|light|quick|nachos|wrap|garlic/.test(msg)) {
        const items = byCategory("Snacks");
        return {
            text: `Something light? 😊\n\n${fmt(items)}\n\nWant me to add one?`,
            chips: items.slice(0, 3).map((p) => `Add ${p.title}`),
        };
    }

    // Desserts
    if (/sweet|dessert|cake|cheesecake|chocolate/.test(msg)) {
        const items = byCategory("Desserts");
        return {
            text: `Sweet tooth! 🍰\n\n${fmt(items)}\n\nShall I add one to your cart?`,
            chips: items.slice(0, 2).map((p) => `Add ${p.title}`),
        };
    }

    // Hungry / heavy
    if (/hungry|starving|heavy|filling|meal/.test(msg)) {
        const burgers = byCategory("Burger");
        const pizzas = byCategory("Pizza");
        const picks = [...burgers.slice(0, 2), ...pizzas.slice(0, 1)];
        return {
            text: `You're hungry? Let's fix that! 😋\n\n${fmt(picks)}\n\nAny of these sound good?`,
            chips: picks.map((p) => `Add ${p.title}`),
        };
    }

    // Best sellers / popular / recommend
    if (/best|popular|recommend|top|famous/.test(msg)) {
        const picks = menuItems.slice(0, 4);
        return {
            text: `Our top picks right now! ⭐\n\n${fmt(picks, 4)}\n\nWant to add any of these?`,
            chips: picks.slice(0, 3).map((p) => `Add ${p.title}`),
        };
    }

    // Surprise / random
    if (/surprise|random|anything|whatever|idk/.test(msg)) {
        const random = menuItems[Math.floor(Math.random() * menuItems.length)];
        return {
            text: `Feeling adventurous? 🎲 How about:\n\n• ${random.title} — ₹${random.price}\n\n${random.desc || ""}\n\nShall I add it to your cart?`,
            chips: [`Add ${random.title}`, "Show more options", "Surprise me again 🎲"],
        };
    }

    // Full menu
    if (/menu|all|list|show|what.*have|what.*got/.test(msg)) {
        const cats = [...new Set(menuItems.map((p) => p.category))];
        return {
            text: `Here's what we serve! 🍽️\n\n${cats.map((c) => `${c}: ${byCategory(c).length} items`).join("\n")}\n\nTell me a category and I'll show you the details!`,
            chips: cats.slice(0, 4),
        };
    }

    // Price / cheap / budget
    if (/cheap|budget|affordable|price|cost|under/.test(msg)) {
        const cheap = [...menuItems].sort((a, b) => a.price - b.price).slice(0, 3);
        return {
            text: `Best value picks! 💰\n\n${fmt(cheap)}\n\nGreat food without breaking the bank! Want to add one?`,
            chips: cheap.map((p) => `Add ${p.title}`),
        };
    }

    // Default fallback
    const random = menuItems[Math.floor(Math.random() * menuItems.length)];
    return {
        text: `Hmm, tell me more about what you're craving! 🤔\n\nAre you in the mood for something heavy like a burger 🍔, light like a snack 🥗, or maybe something sweet 🍰?\n\nOr try: "${random?.title}" — ₹${random?.price}`,
        chips: QUICK_REPLIES,
    };
};

// ── Main export — tries backend Gemini, falls back to rules ──
export const getGeminiResponse = async (history, menuItems) => {
    const lastUserMsg =
        [...history].reverse().find((m) => m.role === "user")?.text || "";

    // Try backend (Gemini) first — silently fall back if it fails
    try {
        const API_URL =
            process.env.REACT_APP_API_URL || "http://localhost:5001/api";

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
        // Backend unavailable — use local engine below
    }

    // Local rule-based engine — always works
    const { text } = getRuleBasedReply(lastUserMsg, menuItems);
    return text;
};

// ── Standalone local reply (used by ChatBot.jsx for chips) ───
export const getLocalReply = (userText, menuItems) =>
    getRuleBasedReply(userText, menuItems);
