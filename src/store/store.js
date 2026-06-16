import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./shopping-cart/cartSlice";
import cartUiSlice from "./shopping-cart/cartUiSlice";
import authSlice from "./shopping-cart/authSlice";
import orderSlice from "./shopping-cart/orderSlice";
import favoritesSlice from "./shopping-cart/favoritesSlice";
import locationSlice from "./shopping-cart/locationSlice";

// restaurantSlice is optional — only import if it exists
let restaurantReducer = null;
try { restaurantReducer = require("./shopping-cart/restaurantSlice").default; } catch { }

const reducers = {
  cart: cartSlice.reducer,
  cartUi: cartUiSlice.reducer,
  auth: authSlice.reducer,
  orders: orderSlice.reducer,
  favorites: favoritesSlice.reducer,
  location: locationSlice.reducer,
};

if (restaurantReducer) reducers.restaurants = restaurantReducer;

const store = configureStore({ reducer: reducers });

export default store;
