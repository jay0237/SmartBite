import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    restaurants: [],
    selectedRestaurant: null,
    loading: false,
    error: null,
    filters: {
        cuisine: [],
        rating: 0,
        sortBy: "default",
    },
};

const restaurantSlice = createSlice({
    name: "restaurants",
    initialState,
    reducers: {
        // Set loading state
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        // Set restaurants list
        setRestaurants: (state, action) => {
            state.restaurants = action.payload;
            state.loading = false;
            state.error = null;
        },

        // Set selected restaurant
        setSelectedRestaurant: (state, action) => {
            state.selectedRestaurant = action.payload;
        },

        // Set error
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        // Update filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Clear filters
        clearFilters: (state) => {
            state.filters = {
                cuisine: [],
                rating: 0,
                sortBy: "default",
            };
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Clear selected restaurant
        clearSelectedRestaurant: (state) => {
            state.selectedRestaurant = null;
        },
    },
});

export const restaurantActions = restaurantSlice.actions;
export default restaurantSlice.reducer;
