const apiConfig = {
  // Force absolute URL - remove any automatic path joining
  baseURL: import.meta.env.VITE_API_URL || "http://0.0.0.0:8000",

  // API endpoints (must start with /)
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
  },

  // Simplified URL constructor
  getUrl: (endpoint: string, params: Record<string, any> = {}): string => {
    // Handle full URLs immediately
    if (endpoint.startsWith("http")) {
      return endpoint;
    }

    // Create URL object with proper base
    const url = new URL(
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
      apiConfig.baseURL
    );

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  },
};

export default apiConfig;
