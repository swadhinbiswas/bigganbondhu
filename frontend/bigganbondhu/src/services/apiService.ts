import axios from "axios";

import apiConfig from "../config/apiConfig";

// Create axios instance with proper base URL handling
const apiClient = axios.create({
  baseURL: apiConfig.baseURL, // Will be empty in dev (for proxy) or full URL in prod
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
  withCredentials: false, // Disable cookie sending
});

// Add request interceptor to handle environment-specific URL construction
apiClient.interceptors.request.use((config) => {
  // In development, the URL will be relative and handled by Vite proxy
  // In production, the URL will be absolute and point directly to backend
  return config;
});

export const apiService = {
  // Generic GET with environment-aware URL handling
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
  getModelUrl: (filename: string) => apiConfig.getUrl(`/${filename}`),

  getSvgUrl: (filename: string) =>
    apiConfig.getUrl(`${apiConfig.apiServerUrl}/api/${filename}`),

  // Health check
  checkHealth: () => apiService.get(apiConfig.endpoints.health),

  // Image analysis
  analyzeImage: async (imageUrl: string) => {
    try {
      const response = await apiClient.post(apiConfig.endpoints.analyzeImage, {
        image_url: imageUrl,
      });

      return response.data;
    } catch (error) {
      console.error("Image analysis failed:", error);
      throw error;
    }
  },
};

export default apiService;
