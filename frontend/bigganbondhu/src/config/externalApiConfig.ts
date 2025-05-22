/**
 * External API configuration
 *
 * This file contains configuration for external APIs used in the application.
 * For production, set the environment variables in your deployment environment.
 * For local development, create a .env file with the required variables.
 */

// Get environment variables with fallbacks
const getEnvVariable = (key: string, fallback: string = ""): string => {
  // For Vite, environment variables are prefixed with VITE_
  const value = import.meta.env[`VITE_${key}`] || fallback;
  return value;
};

export const externalApiConfig = {
  openRouter: {
    apiKey: getEnvVariable(
      "OPENROUTER_API_KEY",
      "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"
    ),
    siteUrl: getEnvVariable("SITE_URL", "https://bigganbondhu.org"),
    siteName: getEnvVariable("SITE_NAME", "বিজ্ঞানবন্ধু"),
  },
  imgHippo: {
    apiKey: getEnvVariable(
      "IMG_HIPPO_API_KEY",
      "3d616717724c7b5a6bd335631bccca33"
    ),
    uploadUrl: getEnvVariable(
      "IMG_HIPPO_UPLOAD_URL",
      "https://api.imghippo.com/v1/upload"
    ),
    deleteUrl: getEnvVariable(
      "IMG_HIPPO_DELETE_URL",
      "https://api.imghippo.com/v1/delete"
    ),
  },
};
