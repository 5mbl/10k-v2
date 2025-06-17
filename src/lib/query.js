import axios from 'axios';


const API_BASE_URL = "http://localhost:8000/api";


export const queryHybrid = async (query) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/hybrid-query`, { query });
      return response.data; 
  
    } catch (error) {
      console.error("Failed to fetch RAG data:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Failed to fetch RAG data");
    }
  };