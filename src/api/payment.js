import API from "./axios";

export const createPaymentOrder = (amount) =>
    API.post("/payment/create-order", { amount });

export const verifyPayment = (data) =>
    API.post("/payment/verify", data);
