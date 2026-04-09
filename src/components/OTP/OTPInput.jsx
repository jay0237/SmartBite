import React, { useRef, useEffect } from "react";
import "./OTPInput.css";

/**
 * OTPInput — 6 individual digit boxes
 * Features: auto-focus, auto-advance, backspace, paste, glow on active
 */
const OTPInput = ({ digits, onChange, hasError, disabled }) => {
    const inputRefs = useRef([]);

    // Focus first empty box on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Re-focus first box when error triggers
    useEffect(() => {
        if (hasError) {
            inputRefs.current[0]?.focus();
        }
    }, [hasError]);

    const handleChange = (index, value) => {
        // Accept digits only
        if (!/^\d*$/.test(value)) return;
        const updated = [...digits];
        updated[index] = value.slice(-1);
        onChange(updated);
        // Auto-advance
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                // Clear current
                const updated = [...digits];
                updated[index] = "";
                onChange(updated);
            } else if (index > 0) {
                // Move back
                inputRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (!pasted) return;
        const updated = ["", "", "", "", "", ""];
        pasted.split("").forEach((ch, i) => { updated[i] = ch; });
        onChange(updated);
        // Focus last filled or next empty
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className={`otp__grid ${hasError ? "otp__grid--error" : ""}`}>
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`otp__box ${digit ? "otp__box--filled" : ""} ${hasError ? "otp__box--error" : ""}`}
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
};

export default OTPInput;
