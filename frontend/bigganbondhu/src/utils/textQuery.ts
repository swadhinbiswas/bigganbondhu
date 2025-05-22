/**
 * Utility functions for text-based AI queries using OpenRouter API
 */

import { externalApiConfig } from "@/config/externalApiConfig";

// OpenRouter API configuration
const {
  apiKey: OPENROUTER_API_KEY,
  siteUrl: SITE_URL,
  siteName: SITE_NAME,
} = externalApiConfig.openRouter;

export interface TextQueryResponse {
  answer: string;
  raw_response?: string;
  model?: string;
}

/**
 * Sends a text query to OpenRouter API
 * @param query Text question from user
 * @returns Promise with query response
 */
export async function queryAI(query: string): Promise<TextQueryResponse> {
  try {
    // Validate query
    if (!query || query.trim().length === 0) {
      throw new Error("প্রশ্ন খালি রাখা যাবে না");
    }

    // Validate API key
    if (
      !OPENROUTER_API_KEY ||
      OPENROUTER_API_KEY === "YOUR_OPENROUTER_API_KEY"
    ) {
      console.error("OpenRouter API key is missing or invalid");
      throw new Error(
        "API configuration error. Please contact the administrator."
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3-4b:free",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful and educational AI assistant for students learning science. Provide accurate, clear, and age-appropriate responses. Explain complex concepts in simple language with relevant examples. When possible, relate answers to everyday experiences to make science more relatable.",
            },
            {
              role: "user",
              content: query,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status}`, errorText);

      // More specific error messages based on status code
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "API authentication error. Please check your API key configuration."
        );
      } else if (response.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      } else {
        throw new Error(
          `প্রশ্নের উত্তর দিতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। (${response.status})`
        );
      }
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response returned from OpenRouter");
    }

    // Extract AI response content
    const aiResponse = data.choices[0].message.content;

    return {
      answer: aiResponse,
      raw_response: aiResponse,
      model: data.model || "qwen/qwen3-4b:free",
    };
  } catch (error) {
    console.error("Text query failed:", error);
    throw error;
  }
}
