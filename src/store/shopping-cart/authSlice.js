import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
const storedToken = localStorage.getItem("token") || null;

const authSlice = createSlice({
    name: "auth",
    initialState: {
        currentUser: storedUser,
        token: storedToken,
    },
    reducers: {
        setCredentials(state, action) {
            const { user, token } = action.payload;
            state.currentUser = user;
            state.token = token;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
        },
        logout(state) {
            state.currentUser = null;
            state.token = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
    },
});

export const authActions = authSlice.actions;
export default authSlice;
