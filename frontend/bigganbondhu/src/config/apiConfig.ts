const apiConfig = {
  // In production, use the full backend URL directly instead of proxy
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL || "http://34.87.148.171:8088"
    : "",

  apiServerUrl: import.meta.env.VITE_API_URL || "http://34.87.148.171:8088",

  endpoints: {
    health: "/api/health",
    physics: "/api/experiments/physics",
    biology: "/api/experiments/biology",
    chemistry: "/api/experiments/chemistry",
    chemicals: "/api/chemistry/chemicals",
    reactions: "/api/chemistry/reactions",
    react: "/api/chemistry/react",
    audio: "/api/audio",
    models: "/api/models",
    svg: "/api/svg",
    analyzeImage: "/api/analyze-image",
  },

  // Simplified URL constructor
  getUrl: (endpoint: string, params: Record<string, any> = {}): string => {
    // Handle full URLs immediately
    if (endpoint.startsWith("http")) {
      return endpoint;
    }

    // For relative URLs, decide whether to use proxy or direct URL
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // In production, use the full backend URL
    const baseUrl = import.meta.env.PROD
      ? import.meta.env.VITE_API_URL || "http://34.87.148.171:8088"
      : "";

    const fullPath = baseUrl + path;

    // If there are no params, return the path directly
    if (Object.keys(params).length === 0) {
      return fullPath;
    }

    // Otherwise, add the query parameters
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return `${fullPath}?${queryParams.toString()}`;
  },
};

export default apiConfig;
