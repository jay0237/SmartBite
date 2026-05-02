import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { cartActions } from "../../store/shopping-cart/cartSlice";
import { getProducts } from "../../api/products";
import localProducts from "../../assets/fake-data/products";
import { getLocalReply, QUICK_REPLIES } from "./chatbotEngine";
import "./ChatBot.css";

const formatTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const WELCOME = {
    id: 1,
    role: "bot",
    text: "Hey! 👋 I'm Bitey, your Smart Bite food buddy.\n\nTell me your mood or what you're craving and I'll pick the perfect meal for you! 😋",
    products: [],
    time: formatTime(),
};

// ── Inline product card rendered inside chat bubble ───────────
const ProductCard = ({ product, onAdd, added }) => (
    <div className="chatbot__product-card">
        <img src={product.image01} alt={product.title} className="chatbot__product-img" />
        <div className="chatbot__product-info">
            <span className="chatbot__product-name">{product.title}</span>
            <span className="chatbot__product-price">₹{product.price}</span>
        </div>
        <button
            className={`chatbot__product-btn ${added ? "added" : ""}`}
            onClick={() => onAdd(product)}
            disabled={added}
        >
            {added ? <><i className="ri-check-line" /> Added</> : <><i className="ri-shopping-cart-line" /> Add</>}
        </button>
    </div>
);

// ── Main ChatBot component ────────────────────────────────────
const ChatBot = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [quickReplies, setQuickReplies] = useState(QUICK_REPLIES);
    const [addedItems, setAddedItems] = useState({}); // track which items were added
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

    // Add product to cart from chat
    const handleAddToCart = useCallback((product) => {
        const id = product._id || product.id;
        dispatch(cartActions.addItem({
            id,
            title: product.title,
            image01: product.image01,
            price: product.price,
            extraIngredients: [],
        }));
        // Mark as added for visual feedback
        setAddedItems((prev) => ({ ...prev, [id]: true }));
        // Add confirmation message
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                role: "bot",
                text: `✅ "${product.title}" added to your cart!\n\nAnything else I can help with? 😊`,
                products: [],
                time: formatTime(),
            },
        ]);
        setQuickReplies(["Show full menu 📋", "I'm feeling hungry 🍔", "I'm done thanks!"]);
    }, [dispatch]);

    const addBotMessage = useCallback((text, products = [], chips = []) => {
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), role: "bot", text, products, time: formatTime() },
        ]);
        setQuickReplies(chips.length > 0 ? chips : QUICK_REPLIES);
    }, []);

    const processMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        // Add user message
        const userMsg = { id: Date.now(), role: "user", text: trimmed, products: [], time: formatTime() };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Simulate typing delay for natural feel
        await new Promise((r) => setTimeout(r, 600));
        setIsTyping(false);

        // Get reply from local engine (always works, no network needed)
        const { text: replyText, products: replyProducts, chips } = getLocalReply(trimmed, menuItems);

        // Handle add-to-cart command
        if (replyText.startsWith("ADD_TO_CART:")) {
            const title = replyText.replace("ADD_TO_CART:", "").trim();
            const product = menuItems.find((p) => p.title.toLowerCase() === title.toLowerCase());
            if (product) {
                handleAddToCart(product);
            } else {
                addBotMessage("Hmm, I couldn't find that item. Try browsing the full menu! 😊", [], ["Show full menu 📋"]);
            }
            return;
        }

        addBotMessage(replyText, replyProducts, chips);
    }, [menuItems, isTyping, addBotMessage, handleAddToCart]);

    const handleSend = () => processMessage(inputValue);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };
    const handleReset = () => {
        setMessages([WELCOME]);
        setQuickReplies(QUICK_REPLIES);
        setAddedItems({});
    };

    return (
        <>
            {/* ── Floating Button ── */}
            <button
                className="chatbot__fab"
                onClick={() => setIsOpen((o) => !o)}
                aria-label="Open food assistant"
            >
                <i className={isOpen ? "ri-close-line" : "ri-robot-line"}></i>
                {!isOpen && <span className="chatbot__fab-badge" />}
            </button>

            {/* ── Popup Panel ── */}
            {isOpen && (
                <div className="chatbot__popup" role="dialog">
                    {/* Header */}
                    <div className="chatbot__header">
                        <div className="chatbot__header-left">
                            <div className="chatbot__avatar">🤖</div>
                            <div>
                                <p className="chatbot__name">Bitey</p>
                                <p className="chatbot__status"><span className="chatbot__dot" /> Online</p>
                            </div>
                        </div>
                        <div className="chatbot__header-right">
                            <button onClick={handleReset} title="Clear chat"><i className="ri-refresh-line" /></button>
                            <button onClick={() => setIsOpen(false)} title="Close"><i className="ri-close-line" /></button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot__messages" role="log" aria-live="polite">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chatbot__msg ${msg.role}`}>
                                {msg.role === "bot" && <div className="chatbot__msg-icon">🤖</div>}
                                <div className="chatbot__msg-wrap">
                                    <div className="chatbot__bubble">{msg.text}</div>

                                    {/* ── Inline product cards ── */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="chatbot__product-list">
                                            {msg.products.map((product) => {
                                                const pid = product._id || product.id;
                                                return (
                                                    <ProductCard
                                                        key={pid}
                                                        product={product}
                                                        onAdd={handleAddToCart}
                                                        added={!!addedItems[pid]}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}

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
                        />
                        <button
                            className="chatbot__send"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <i className="ri-send-plane-fill" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;
