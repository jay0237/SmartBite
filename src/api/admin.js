import API from "./axios";

export const getStats = () => API.get("/admin/stats");
export const getAdminOrders = () => API.get("/admin/orders");
export const updateOrderStatus = (id, status) => API.put(`/admin/orders/${id}/status`, { status });
export const getAdminUsers = () => API.get("/admin/users");
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const getAdminProducts = () => API.get("/admin/products");
export const createProduct = (data) => API.post("/admin/products", data);
export const updateProduct = (id, data) => API.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/admin/products/${id}`);
