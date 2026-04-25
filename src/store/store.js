import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./shopping-cart/cartSlice";
import cartUiSlice from "./shopping-cart/cartUiSlice";
import authSlice from "./shopping-cart/authSlice";
import orderSlice from "./shopping-cart/orderSlice";
import restaurantReducer from "./shopping-cart/restaurantSlice";

const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    cartUi: cartUiSlice.reducer,
    auth: authSlice.reducer,
    orders: orderSlice.reducer,
    restaurants: restaurantReducer,
  },
});

export default store;
