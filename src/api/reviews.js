import API from "./axios";

export const getReviews = (productId) => API.get(`/reviews/${productId}`);
export const addReview = (productId, data) => API.post(`/reviews/${productId}`, data);
export const deleteReview = (reviewId) => API.delete(`/reviews/${reviewId}`);
export const canReview = (productId) => API.get(`/reviews/can-review/${productId}`);
