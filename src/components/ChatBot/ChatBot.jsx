import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store/shopping-cart/cartSlice";
import { getProducts } from "../../api/products";
import localProducts from "../../assets/fake-data/products";
import { getGeminiResponse, getLocalReply, QUICK_REPLIES } from "./chatbotEngine";
import "./ChatBot.css";

const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME = {
    id: 1,
    role: "bot",
    text: "Hey! 👋 I'm Bitey, your Smart Bite food buddy. Tell me your mood or what you're craving and I'll pick the perfect meal for you! 😋",
    time: formatTime(),
};

const ChatBot = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [quickReplies, setQuickReplies] = useState(QUICK_REPLIES);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Load menu once
    useEffect(() => {
        getProducts({})
            .then((res) => {
                const list = res?.data?.products;
                setMenuItems(
                    Array.isArray(list) && list.length > 0
                        ? list.map((p) => ({ ...p, id: p._id || p.id }))
                        : localProducts
                );
            })
            .catch(() => setMenuItems(localProducts));
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Focus input when popup opens
    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    const addBotMessage = useCallback((text, chips = []) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: "bot", text, time: formatTime() },
        ]);
        setQuickReplies(chips.length > 0 ? chips : QUICK_REPLIES);
    }, []);

    const handleAddToCart = useCallback(
        (title) => {
            const product = menuItems.find(
                (p) => p.title.toLowerCase() === title.toLowerCase()
            );
            if (product) {
                dispatch(
                    cartActions.addItem({
                        id: product._id || product.id,
                        title: product.title,
                        image01: product.image01,
                        price: product.price,
                    })
                );
                addBotMessage(
                    `✅ "${product.title}" added to your cart!\n\nAnything else? 😊`,
                    ["Show full menu", "Keep browsing", "I'm done thanks!"]
                );
            } else {
                addBotMessage("Hmm, I couldn't find that item. Try browsing the full menu! 😊");
            }
        },
        [menuItems, dispatch, addBotMessage]
    );

    const processMessage = useCallback(
        async (text) => {
            const trimmed = text.trim();
            if (!trimmed || isTyping) return;

            // Add user message
            const userMsg = { id: Date.now(), role: "user", text: trimmed, time: formatTime() };
            setMessages((prev) => [...prev, userMsg]);
            setInputValue("");
            setIsTyping(true);

            try {
                // Build history for Gemini (exclude welcome, include all prior turns)
                const history = [
                    ...messages.filter((m) => m.id !== 1),
                    userMsg,
                ].map((m) => ({ role: m.role, text: m.text }));

                const reply = await getGeminiResponse(history, menuItems);

                setIsTyping(false);

                // Check if reply is an add-to-cart command
                if (reply.startsWith("ADD_TO_CART:")) {
                    const itemTitle = reply.replace("ADD_TO_CART:", "").trim();
                    handleAddToCart(itemTitle);
                    return;
                }

                // Get smart chips from local engine based on user message
                const { chips } = getLocalReply(trimmed, menuItems);
                addBotMessage(reply, chips);
            } catch (err) {
                setIsTyping(false);
                console.error("Chatbot error:", err);
                // Use local engine as final fallback — never show error to user
                const { text, chips } = getLocalReply(trimmed, menuItems);
                if (text.startsWith("ADD_TO_CART:")) {
                    handleAddToCart(text.replace("ADD_TO_CART:", "").trim());
                } else {
                    addBotMessage(text, chips);
                }
            }
        },
        [messages, menuItems, isTyping, addBotMessage, handleAddToCart]
    );

    const handleSend = () => processMessage(inputValue);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReset = () => {
        setMessages([WELCOME]);
        setQuickReplies(QUICK_REPLIES);
    };

    return (
        <>
            {/* ── Floating Button ── */}
            <button
                className="chatbot__fab"
                onClick={() => setIsOpen((o) => !o)}
                aria-label="Open food assistant"
                title="Chat with Bitey"
            >
                <i className={isOpen ? "ri-close-line" : "ri-robot-line"}></i>
                {!isOpen && <span className="chatbot__fab-badge" />}
            </button>

            {/* ── Popup Panel ── */}
            {isOpen && (
                <div className="chatbot__popup" role="dialog" aria-label="Smart Bite food assistant">
                    {/* Header */}
                    <div className="chatbot__header">
                        <div className="chatbot__header-left">
                            <div className="chatbot__avatar">🤖</div>
                            <div>
                                <p className="chatbot__name">Bitey</p>
                                <p className="chatbot__status">
                                    <span className="chatbot__dot" /> Online
                                </p>
                            </div>
                        </div>
                        <div className="chatbot__header-right">
                            <button onClick={handleReset} title="Clear chat" aria-label="Clear chat">
                                <i className="ri-refresh-line"></i>
                            </button>
                            <button onClick={() => setIsOpen(false)} title="Close" aria-label="Close">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot__messages" role="log" aria-live="polite">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chatbot__msg ${msg.role}`}>
                                {msg.role === "bot" && (
                                    <div className="chatbot__msg-icon">🤖</div>
                                )}
                                <div className="chatbot__msg-wrap">
                                    <div className="chatbot__bubble">{msg.text}</div>
                                    <span className="chatbot__time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chatbot__msg bot">
                                <div className="chatbot__msg-icon">🤖</div>
                                <div className="chatbot__typing-bubble">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    <div className="chatbot__chips">
                        {quickReplies.slice(0, 4).map((r, i) => (
                            <button key={i} className="chatbot__chip" onClick={() => processMessage(r)}>
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="chatbot__input-row">
                        <input
                            ref={inputRef}
                            className="chatbot__input"
                            type="text"
                            placeholder="Ask me anything about food..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            maxLength={300}
                            aria-label="Message input"
                        />
                        <button
                            className="chatbot__send"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            aria-label="Send"
                        >
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
