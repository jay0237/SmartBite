import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { authActions } from "../store/shopping-cart/authSlice";
import { fetchFavorites } from "../store/shopping-cart/favoritesSlice";
import { sendOtp as sendOtpAPI, verifyOtp as verifyOtpAPI, register as registerAPI } from "../api/auth";
import OTPInput from "../components/OTP/OTPInput";
import Helmet from "../components/Helmet/Helmet";
import "./Register.css";

const OTP_EXPIRY = 120;

const Field = ({ label, name, type, placeholder, value, onChange }) => (
    <div className="reg__field">
        <label className="reg__label">{label}</label>
        <input name={name} type={type} placeholder={placeholder} value={value}
            onChange={onChange} required autoComplete="off" className="reg__input" />
    </div>
);

const StepBar = ({ current }) => (
    <div className="reg__steps">
        {[{ n: 1, label: "Details" }, { n: 2, label: "Verify" }].map(({ n, label }, i, arr) => (
            <React.Fragment key={n}>
                <div className="reg__step">
                    <div className={`reg__step-circle ${current >= n ? "active" : ""} ${current > n ? "done" : ""}`}>
                        {current > n ? <i className="ri-check-line" /> : n}
                    </div>
                    <span className={`reg__step-label ${current >= n ? "active" : ""}`}>{label}</span>
                </div>
                {i < arr.length - 1 && <div className={`reg__step-line ${current > 1 ? "active" : ""}`} />}
            </React.Fragment>
        ))}
    </div>
);

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [formErr, setFormErr] = useState("");
    const [sending, setSending] = useState(false);
    const [step, setStep] = useState(1);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpErr, setOtpErr] = useState("");
    const [hasError, setHasError] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(0);
    const [resending, setResending] = useState(false);
    const [devOtp, setDevOtp] = useState(""); // shown on screen when email fails
    const timerRef = useRef(null);

    useEffect(() => {
        if (timer > 0) {
            timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [timer]);

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormErr("");
    };

    const triggerShake = () => {
        setHasError(true);
        setTimeout(() => setHasError(false), 600);
    };

    // ── Step 1: validate & send OTP via backend ──
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setFormErr("");
        if (form.password !== form.confirm) return setFormErr("Passwords do not match.");
        if (form.password.length < 6) return setFormErr("Password must be at least 6 characters.");

        setSending(true);
        try {
            const { data } = await sendOtpAPI({ email: form.email, name: form.name });
            // Dev mode: backend returns devOtp when email fails
            if (data.devOtp) {
                console.info("%c[Smart Bite Dev OTP]", "color:#ff6b35;font-weight:bold;font-size:14px", "\nOTP:", data.devOtp);
                setDevOtp(data.devOtp); // show on screen so you can still register
            } else {
                setDevOtp("");
            }
            setStep(2);
            setTimer(OTP_EXPIRY);
            setOtpDigits(["", "", "", "", "", ""]);
        } catch (err) {
            setFormErr(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setSending(false);
        }
    };

    // ── Step 2: verify OTP via backend ──
    const handleVerify = async (e) => {
        e?.preventDefault();
        const entered = otpDigits.join("");
        if (entered.length < 6) { setOtpErr("Please enter all 6 digits."); triggerShake(); return; }

        setVerifying(true);
        try {
            await verifyOtpAPI({ email: form.email, otp: entered });

            // OTP verified — now register
            const { data } = await registerAPI({ name: form.name, email: form.email, password: form.password });
            dispatch(authActions.setCredentials({ user: data.user, token: data.token }));
            dispatch(fetchFavorites());
            setSuccess(true);
            setTimeout(() => navigate("/home"), 1400);
        } catch (err) {
            const msg = err.response?.data?.message || "Verification failed.";
            setOtpErr(msg);
            setOtpDigits(["", "", "", "", "", ""]);
            triggerShake();
        } finally {
            setVerifying(false);
        }
    };

    // Auto-submit when all 6 digits filled
    useEffect(() => {
        if (step === 2 && otpDigits.every((d) => d !== "") && !verifying && !success) {
            handleVerify();
        }
    }, [otpDigits]); // eslint-disable-line

    // ── Resend OTP ──
    const handleResend = async () => {
        if (timer > 0 || resending) return;
        setResending(true);
        setOtpErr("");
        setOtpDigits(["", "", "", "", "", ""]);
        try {
            const { data } = await sendOtpAPI({ email: form.email, name: form.name });
            if (data.devOtp) {
                console.info("%c[Dev OTP Resend]", "color:#ff6b35;font-weight:bold", data.devOtp);
                setDevOtp(data.devOtp);
            }
            setTimer(OTP_EXPIRY);
        } catch (err) {
            setOtpErr(err.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setResending(false);
        }
    };

    return (
        <Helmet title="Create Account">
            <div className="reg__page">
                <div className="reg__orb reg__orb--1" />
                <div className="reg__orb reg__orb--2" />
                <div className="reg__wrapper">
                    <StepBar current={step} />

                    <AnimatePresence mode="wait">

                        {/* ── Step 1: Details ── */}
                        {step === 1 && (
                            <motion.div key="s1" className="reg__card"
                                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35 }}>

                                <div className="reg__card-header">
                                    <div className="reg__icon-wrap"><i className="ri-user-add-line" /></div>
                                    <h2>Create Account</h2>
                                    <p>Fill in your details — we'll verify your email with an OTP</p>
                                </div>

                                <AnimatePresence>
                                    {formErr && (
                                        <motion.div className="reg__alert reg__alert--error"
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                            <i className="ri-error-warning-line" /> {formErr}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSendOtp} noValidate>
                                    <Field label="Full Name" name="name" type="text" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} />
                                    <Field label="Email Address" name="email" type="email" placeholder="rahul@example.com" value={form.email} onChange={handleChange} />
                                    <Field label="Password" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                                    <Field label="Confirm Password" name="confirm" type="password" placeholder="Repeat password" value={form.confirm} onChange={handleChange} />

                                    <button type="submit" className="reg__btn" disabled={sending}>
                                        {sending
                                            ? <><i className="ri-loader-4-line reg__spin" /> Sending OTP...</>
                                            : <><i className="ri-mail-send-line" /> Send OTP &amp; Continue</>}
                                    </button>
                                </form>

                                <p className="reg__footer-text">
                                    Already have an account? <Link to="/login">Sign in</Link>
                                </p>
                            </motion.div>
                        )}

                        {/* ── Step 2: OTP Verify ── */}
                        {step === 2 && (
                            <motion.div key="s2" className="reg__card"
                                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35 }}
                                style={{ position: "relative", overflow: "hidden" }}>

                                {/* Success overlay */}
                                <AnimatePresence>
                                    {success && (
                                        <motion.div className="reg__success-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <motion.div className="reg__success-icon"
                                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
                                                <i className="ri-checkbox-circle-fill" />
                                            </motion.div>
                                            <h4>Verified!</h4>
                                            <p>Welcome to Smart Bite 🎉</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="reg__card-header">
                                    <div className="reg__icon-wrap reg__icon-wrap--mail"><i className="ri-mail-check-line" /></div>
                                    <h2>Check Your Email</h2>
                                    <p>We sent a 6-digit OTP to<br />
                                        <strong className="reg__email-highlight">{form.email}</strong></p>
                                </div>

                                {/* Dev mode OTP banner — shown when email sending fails */}
                                {devOtp && (
                                    <div style={{
                                        background: "rgba(255,215,0,0.08)",
                                        border: "1px solid rgba(255,215,0,0.3)",
                                        borderRadius: "var(--radius-sm)",
                                        padding: "14px 16px",
                                        marginBottom: 16,
                                        textAlign: "center",
                                    }}>
                                        <p style={{ color: "#ffd700", fontSize: "0.8rem", margin: "0 0 6px" }}>
                                            <i className="ri-code-line me-1"></i>
                                            <strong>Dev Mode</strong> — Email not configured. Your OTP:
                                        </p>
                                        <span style={{
                                            fontSize: "1.8rem", fontWeight: 800,
                                            letterSpacing: 10, color: "#ff6b35",
                                        }}>{devOtp}</span>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {otpErr && (
                                        <motion.div className="reg__alert reg__alert--error"
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                            <i className="ri-error-warning-line" /> {otpErr}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleVerify} noValidate>
                                    <OTPInput digits={otpDigits}
                                        onChange={(d) => { setOtpDigits(d); setOtpErr(""); }}
                                        hasError={hasError} disabled={verifying || success} />

                                    <button type="submit" className="reg__btn"
                                        disabled={verifying || success || otpDigits.join("").length < 6}>
                                        {verifying
                                            ? <><i className="ri-loader-4-line reg__spin" /> Verifying...</>
                                            : <><i className="ri-shield-check-line" /> Verify Account</>}
                                    </button>
                                </form>

                                <div className="reg__resend">
                                    {timer > 0
                                        ? <span>Resend OTP in <strong className="reg__timer">{fmt(timer)}</strong></span>
                                        : <button className="reg__resend-btn" onClick={handleResend} disabled={resending}>
                                            <i className="ri-refresh-line" /> {resending ? "Sending..." : "Resend OTP"}
                                        </button>}
                                </div>

                                <div className="text-center mt-2">
                                    <button className="reg__change-email"
                                        onClick={() => { setStep(1); setOtpErr(""); setOtpDigits(["", "", "", "", "", ""]); }}>
                                        <i className="ri-arrow-left-line" /> Change email
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </Helmet>
    );
};

export default Register;
