/**
 * Utility functions for uploading images to ImgHippo
 */

import { externalApiConfig } from "@/config/externalApiConfig";

// ImgHippo API configuration
const { apiKey: API_KEY, uploadUrl: UPLOAD_URL } = externalApiConfig.imgHippo;

export interface ImageUploadResponse {
  success: boolean;
  status: number;
  message: string;
  data?: {
    title: string;
    url: string;
    view_url: string;
    extension: string;
    size: number;
    created_at: string;
  };
  error?: string;
}

/**
 * Uploads an image to ImgHippo and returns the response
 * @param file The image file to upload
 * @param title Optional title for the image
 * @returns Promise with the upload response
 */
export async function uploadImage(
  file: File,
  title?: string,
): Promise<ImageUploadResponse> {
  try {
    // Validate file
    if (!file) {
      return {
        success: false,
        status: 400,
        message: "No file provided",
      };
    }

    // Validate file type
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validImageTypes.includes(file.type)) {
      return {
        success: false,
        status: 400,
        message:
          "Invalid file type. Please upload a valid image (JPEG, PNG, GIF, or WEBP).",
      };
    }

    // Validate API key
    if (!API_KEY || API_KEY === "YOUR_IMG_HIPPO_API_KEY") {
      console.error("ImgHippo API key is missing or invalid");

      return {
        success: false,
        status: 500,
        message: "API configuration error. Please contact the administrator.",
      };
    }

    const formData = new FormData();

    formData.append("api_key", API_KEY);
    formData.append("file", file);

    if (title) {
      formData.append("title", title);
    }

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`ImgHippo upload error: ${response.status}`);
      throw new Error(
        `ছবি আপলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। (${response.status})`,
      );
    }

    const data = await response.json();

    return data as ImageUploadResponse;
  } catch (error) {
    console.error("Image upload failed:", error);

    return {
      success: false,
      status: 500,
      message: error instanceof Error ? error.message : "Unknown upload error",
      error: String(error),
    };
  }
}
