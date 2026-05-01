import API from "./axios";

export const getFavorites = () => API.get("/favorites");
export const toggleDish = (dishId) => API.post("/favorites/toggle-dish", { dishId });
