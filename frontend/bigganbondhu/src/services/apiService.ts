import axios from "axios";
import apiConfig from "../config/apiConfig";

// Create axios instance with relative paths that will be handled by Vite's proxy
const apiClient = axios.create({
  baseURL: apiConfig.baseURL, // Empty string for relative URLs
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
  withCredentials: false, // Disable cookie sending
});

// No need to modify paths - let the requests be relative so they go through the proxy
// This removes the interceptor that was prepending the absolute baseURL

export const apiService = {
  // Generic GET with absolute URL enforcement
  get: async <T>(endpoint: string, params = {}): Promise<T> => {
    const url = apiConfig.getUrl(endpoint);
    try {
      const response = await apiClient.get(url, { params });
      return response.data as T;
    } catch (error) {
      console.error(`API Error [GET ${url}]:`, error);
      throw error;
    }
  },

  // Physics API
  physics: {
    getExperiments: () => apiService.get(apiConfig.endpoints.physics),
  },

  // Biology API
  biology: {
    getExperiments: (category?: string) =>
      apiService.get(apiConfig.endpoints.biology, category ? { category } : {}),
  },

  // Chemistry API
  chemistry: {
    getAll: () => apiService.get(apiConfig.endpoints.chemistry),
    getChemicals: () => apiService.get(apiConfig.endpoints.chemicals),
    getReactions: () => apiService.get(apiConfig.endpoints.reactions),
    performReaction: (
      chem1: string,
      chem2: string,
      temperature = 25.0,
      mixingSpeed = 50.0,
      actions?: string
    ) =>
      apiService.get(apiConfig.endpoints.react, {
        chem1,
        chem2,
        temperature,
        mixing_speed: mixingSpeed,
        ...(actions && { actions }),
      }),
  },

  // Audio API
  audio: {
    getAudio: (text: string) =>
      apiConfig.getUrl(apiConfig.endpoints.audio, { text }),
  },

  // File URLs
  getModelUrl: (filename: string) =>
    apiConfig.getUrl(`${apiConfig.endpoints.models}/${filename}`),

  getSvgUrl: (filename: string) =>
    apiConfig.getUrl(`${apiConfig.endpoints.svg}/${filename}`),

  // Health check
  checkHealth: () => apiService.get(apiConfig.endpoints.health),
};

export default apiService;
