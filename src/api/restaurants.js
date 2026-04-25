import axios from "./axios";

const API_URL = "/restaurants";

// Get all restaurants
export const getRestaurants = async (params = {}) => {
    try {
        const response = await axios.get(API_URL, { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get single restaurant
export const getRestaurantById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get restaurant menu
export const getRestaurantMenu = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}/menu`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Search restaurants
export const searchRestaurants = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/search`, {
            params: { query },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Create restaurant (admin)
export const createRestaurant = async (data) => {
    try {
        const response = await axios.post(API_URL, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update restaurant (admin)
export const updateRestaurant = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete restaurant (admin)
export const deleteRestaurant = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
