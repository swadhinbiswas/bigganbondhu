export const externalApiConfig = {
  openRouter: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    siteUrl: "https://bigganbondhu.org",
    siteName: "বিজ্ঞানবন্ধু",
  },
  imgHippo: {
    apiKey: import.meta.env.VITE_IMG_HIPPO_API_KEY,
    uploadUrl: "https://api.imghippo.com/v1/upload",
    deleteUrl: "https://api.imghippo.com/v1/delete",
  },
};
