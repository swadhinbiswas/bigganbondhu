const apiConfig = {
  // Always use empty baseURL to go through proxy/rewrite
  // This avoids mixed content issues (HTTPS frontend -> HTTP backend)
  baseURL: "",

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

    // Always use relative URLs to go through proxy/rewrite
    // This avoids mixed content issues and works in both dev and production
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // If there are no params, return the path directly
    if (Object.keys(params).length === 0) {
      return path;
    }

    // Otherwise, add the query parameters
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return `${path}?${queryParams.toString()}`;
  },
};

export default apiConfig;
