import API from "./axios";

export const placeOrder = (data) => API.post("/orders", data);
export const getMyOrders = () => API.get("/orders/my");
export const trackOrder = (id) => API.get(`/orders/track/${id}`);
export const getOrder = (id) => API.get(`/orders/${id}`);
