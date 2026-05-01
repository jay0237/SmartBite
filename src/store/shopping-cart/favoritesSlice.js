import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getFavorites as getFavoritesAPI, toggleDish as toggleDishAPI } from "../../api/favorites";

// ── Async thunks ─────────────────────────────────────────────

export const fetchFavorites = createAsyncThunk(
    "favorites/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await getFavoritesAPI();
            return data.favorites;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch favorites");
        }
    }
);

export const toggleFavoriteDish = createAsyncThunk(
    "favorites/toggleDish",
    async (dish, { rejectWithValue }) => {
        try {
            const dishId = dish._id || dish.id;
            const { data } = await toggleDishAPI(dishId);
            return { action: data.action, dish };
        } catch (err) {
            return rejectWithValue({ message: err.response?.data?.message || "Failed", dish });
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────
const favoritesSlice = createSlice({
    name: "favorites",
    initialState: {
        dishes: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearFavorites(state) {
            state.dishes = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {

        // ── fetchFavorites ──────────────────────────────────
        builder
            .addCase(fetchFavorites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (state, action) => {
                state.loading = false;
                state.dishes = action.payload?.dishes || [];
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── toggleFavoriteDish — optimistic update ──────────
        builder
            .addCase(toggleFavoriteDish.pending, (state, action) => {
                // Optimistic: update UI immediately
                const dish = action.meta.arg;
                const dishId = dish._id || dish.id;
                const exists = state.dishes.some((d) => (d._id || d.id) === dishId);
                if (exists) {
                    state.dishes = state.dishes.filter((d) => (d._id || d.id) !== dishId);
                } else {
                    state.dishes.push(dish);
                }
            })
            .addCase(toggleFavoriteDish.fulfilled, (state, action) => {
                // Server confirmed — sync with server response
                const { action: serverAction, dish } = action.payload;
                const dishId = dish._id || dish.id;
                if (serverAction === "removed") {
                    state.dishes = state.dishes.filter((d) => (d._id || d.id) !== dishId);
                } else if (serverAction === "added") {
                    const exists = state.dishes.some((d) => (d._id || d.id) === dishId);
                    if (!exists) state.dishes.push(dish);
                }
            })
            .addCase(toggleFavoriteDish.rejected, (state, action) => {
                // Revert optimistic update — re-toggle back
                const dish = action.payload?.dish;
                if (!dish) return;
                const dishId = dish._id || dish.id;
                const exists = state.dishes.some((d) => (d._id || d.id) === dishId);
                if (exists) {
                    state.dishes = state.dishes.filter((d) => (d._id || d.id) !== dishId);
                } else {
                    state.dishes.push(dish);
                }
                state.error = action.payload?.message || "Failed to update favorites";
            });
    },
});

export const { clearFavorites } = favoritesSlice.actions;

// ── Selectors ─────────────────────────────────────────────────
export const selectFavoriteDishes = (state) => state.favorites.dishes;
export const selectFavoritesCount = (state) => state.favorites.dishes.length;
export const selectIsDishFavorited = (dishId) => (state) =>
    state.favorites.dishes.some((d) => (d._id || d.id) === dishId);

export default favoritesSlice;
