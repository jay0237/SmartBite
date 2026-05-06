import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getReviews, addReview, deleteReview, canReview } from "../../../api/reviews";
import "./ProductReviews.css";

// ── Star display / picker ─────────────────────────────────────
const Stars = ({ rating, size = "sm", interactive = false, onRate }) => {
    const [hovered, setHovered] = useState(0);
    const display = interactive ? (hovered || rating) : rating;
    return (
        <div className={`stars stars--${size}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <i key={star}
                    className={star <= display ? "ri-star-fill" : "ri-star-line"}
                    style={{
                        color: star <= display ? "#ffd700" : "var(--text-muted)",
                        cursor: interactive ? "pointer" : "default",
                    }}
                    onMouseEnter={() => interactive && setHovered(star)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    onClick={() => interactive && onRate && onRate(star)}
                />
            ))}
        </div>
    );
};

// ── Rating distribution bar ───────────────────────────────────
const RatingBar = ({ label, count, total }) => (
    <div className="rating__bar-row">
        <span className="rating__bar-label">{label}★</span>
        <div className="rating__bar-track">
            <div className="rating__bar-fill"
                style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
        </div>
        <span className="rating__bar-count">{count}</span>
    </div>
);

// ── Main component ────────────────────────────────────────────
const ProductReviews = ({ productId }) => {
    const currentUser = useSelector((s) => s.auth.currentUser);
    const navigate = useNavigate();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({ rating: 0, comment: "" });
    const [eligibility, setEligibility] = useState(null);
    // { canReview, alreadyReviewed, hasPurchased }

    const fetchReviews = () => {
        setLoading(true);
        getReviews(productId)
            .then(({ data }) => setReviews(data.reviews))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    // Check if logged-in user can review
    const checkEligibility = () => {
        if (!currentUser || !productId) return;
        canReview(productId)
            .then(({ data }) => setEligibility(data))
            .catch(() => setEligibility(null));
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
            checkEligibility();
        }
    }, [productId, currentUser]); // eslint-disable-line

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const dist = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    const timeAgo = (date) => {
        const days = Math.floor((Date.now() - new Date(date)) / 86400000);
        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        if (days < 30) return `${days}d ago`;
        if (days < 365) return `${Math.floor(days / 30)}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) { navigate("/login"); return; }
        if (form.rating === 0) { setError("Please select a star rating."); return; }
        if (!form.comment.trim()) { setError("Please write a comment."); return; }

        setSubmitting(true);
        setError("");
        try {
            await addReview(productId, { rating: form.rating, comment: form.comment.trim() });
            setSuccess("Review submitted! Thank you 🎉");
            setForm({ rating: 0, comment: "" });
            setShowForm(false);
            fetchReviews();
            checkEligibility();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Delete your review?")) return;
        try {
            await deleteReview(reviewId);
            fetchReviews();
            checkEligibility();
        } catch (err) { console.error(err); }
    };

    // ── What to show for the write-review button ──────────────
    const renderWriteBtn = () => {
        if (!currentUser) {
            return (
                <button className="reviews__write-btn" onClick={() => navigate("/login")}>
                    <i className="ri-login-box-line me-1"></i>Sign in to Review
                </button>
            );
        }
        if (eligibility?.alreadyReviewed) {
            return (
                <span className="reviews__reviewed-badge">
                    <i className="ri-checkbox-circle-fill me-1"></i>You reviewed this
                </span>
            );
        }
        if (eligibility?.canReview) {
            return (
                <button className="reviews__write-btn" onClick={() => setShowForm((v) => !v)}>
                    <i className="ri-edit-line me-1"></i>
                    {showForm ? "Cancel" : "Write a Review"}
                </button>
            );
        }
        if (eligibility?.hasPurchased === false) {
            return (
                <span className="reviews__locked-badge">
                    <i className="ri-lock-line me-1"></i>Order this item to review
                </span>
            );
        }
        return null;
    };

    return (
        <div className="reviews__section">
            <div className="reviews__header">
                <h4 className="reviews__title">
                    Customer Reviews
                    {reviews.length > 0 && (
                        <span className="reviews__count">({reviews.length})</span>
                    )}
                </h4>
                {renderWriteBtn()}
            </div>

            {/* ── Rating summary ── */}
            {reviews.length > 0 && (
                <div className="reviews__summary">
                    <div className="reviews__avg">
                        <span className="reviews__avg-number">{avgRating}</span>
                        <Stars rating={Math.round(avgRating)} size="md" />
                        <span className="reviews__avg-label">
                            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="reviews__bars">
                        {dist.map(({ star, count }) => (
                            <RatingBar key={star} label={star} count={count} total={reviews.length} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Success alert ── */}
            <AnimatePresence>
                {success && (
                    <motion.div className="reviews__alert reviews__alert--success"
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <i className="ri-checkbox-circle-line me-2"></i>{success}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Write review form ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.form className="reviews__form" onSubmit={handleSubmit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}>

                        <div className="reviews__verified-notice">
                            <i className="ri-shield-check-fill me-1"></i>
                            Verified Purchase — your review will show a verified badge
                        </div>

                        <h6 className="reviews__form-title">Your Review</h6>

                        <div className="reviews__form-row">
                            <label>Rating</label>
                            <Stars rating={form.rating} size="lg" interactive
                                onRate={(r) => { setForm({ ...form, rating: r }); setError(""); }} />
                        </div>

                        <div className="reviews__form-row">
                            <label>Comment</label>
                            <textarea
                                value={form.comment}
                                onChange={(e) => { setForm({ ...form, comment: e.target.value }); setError(""); }}
                                placeholder="Share your experience with this dish..."
                                rows={3}
                                maxLength={500}
                                className="reviews__textarea"
                            />
                            <span className="reviews__char-count">{form.comment.length}/500</span>
                        </div>

                        {error && (
                            <p className="reviews__form-error">
                                <i className="ri-error-warning-line me-1"></i>{error}
                            </p>
                        )}

                        <button type="submit" className="reviews__submit-btn" disabled={submitting}>
                            {submitting
                                ? <><i className="ri-loader-4-line" style={{ animation: "reg-spin 0.8s linear infinite", display: "inline-block" }} /> Submitting...</>
                                : <><i className="ri-send-plane-line me-1" />Submit Review</>}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* ── Reviews list ── */}
            {loading ? (
                <div className="reviews__loading">
                    <i className="ri-loader-4-line" style={{ animation: "reg-spin 1s linear infinite", display: "inline-block", fontSize: "1.5rem", color: "var(--primary)" }}></i>
                </div>
            ) : reviews.length === 0 ? (
                <div className="reviews__empty">
                    <i className="ri-chat-3-line"></i>
                    <p>No reviews yet. Order this dish and be the first to review!</p>
                </div>
            ) : (
                <div className="reviews__list">
                    <AnimatePresence>
                        {reviews.map((review, i) => (
                            <motion.div key={review._id} className="review__card"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}>

                                <div className="review__card-header">
                                    <div className="review__avatar">
                                        {review.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="review__meta">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="review__name">{review.name}</span>
                                            {review.verified && (
                                                <span className="review__verified-badge">
                                                    <i className="ri-shield-check-fill me-1"></i>Verified
                                                </span>
                                            )}
                                        </div>
                                        <span className="review__date">{timeAgo(review.createdAt)}</span>
                                    </div>
                                    <div className="review__stars">
                                        <Stars rating={review.rating} size="sm" />
                                    </div>
                                    {(currentUser?._id === review.user || currentUser?.role === "admin") && (
                                        <button className="review__delete-btn"
                                            onClick={() => handleDelete(review._id)} title="Delete review">
                                            <i className="ri-delete-bin-line"></i>
                                        </button>
                                    )}
                                </div>
                                <p className="review__comment">{review.comment}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
