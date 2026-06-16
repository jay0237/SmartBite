import { createSlice } from "@reduxjs/toolkit";

const storedAddress = localStorage.getItem("delivery_address") || "";
const storedCity = localStorage.getItem("delivery_city") || "";

const locationSlice = createSlice({
  name: "location",
  initialState: {
    address: storedAddress,
    city: storedCity,
    coords: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess(state, action) {
      state.loading = false;
      state.address = action.payload.address;
      state.city = action.payload.city;
      state.coords = action.payload.coords;
      localStorage.setItem("delivery_address", action.payload.address);
      localStorage.setItem("delivery_city", action.payload.city);
    },
    fetchFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearLocation(state) {
      state.address = "";
      state.city = "";
      state.coords = null;
      localStorage.removeItem("delivery_address");
      localStorage.removeItem("delivery_city");
    }
  }
});

export const locationActions = locationSlice.actions;
export default locationSlice;
