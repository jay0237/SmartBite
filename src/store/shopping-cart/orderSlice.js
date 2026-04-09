import { createSlice } from "@reduxjs/toolkit";

const savedOrders = localStorage.getItem("orders") !== null
    ? JSON.parse(localStorage.getItem("orders"))
    : [];

const orderSlice = createSlice({
    name: "orders",
    initialState: { orders: savedOrders },
    reducers: {
        placeOrder(state, action) {
            const order = {
                id: "ORD-" + Date.now(),
                ...action.payload,
                status: "Confirmed",
                placedAt: new Date().toISOString(),
                timeline: [
                    { step: "Order Confirmed", done: true, time: new Date().toLocaleTimeString() },
                    { step: "Preparing", done: false, time: "" },
                    { step: "Out for Delivery", done: false, time: "" },
                    { step: "Delivered", done: false, time: "" },
                ],
            };
            state.orders.push(order);
            localStorage.setItem("orders", JSON.stringify(state.orders));
        },
        updateOrderStatus(state, action) {
            const { id, status, stepIndex } = action.payload;
            const order = state.orders.find(o => o.id === id);
            if (order) {
                order.status = status;
                if (stepIndex !== undefined) {
                    order.timeline[stepIndex].done = true;
                    order.timeline[stepIndex].time = new Date().toLocaleTimeString();
                }
                localStorage.setItem("orders", JSON.stringify(state.orders));
            }
        },
    },
});

export const orderActions = orderSlice.actions;
export default orderSlice;
