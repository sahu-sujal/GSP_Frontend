import { create } from "zustand";
import { API_URL } from "../../lib/constants";

export const useAdmin = create((set) => ({
  isAuthenticated: false,
  loading: false,
  error: null,
  adminLogin: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("adminToken", data.token);
      set({ isAuthenticated: true, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem("adminToken");
    set({ isAuthenticated: false });
  },
}));