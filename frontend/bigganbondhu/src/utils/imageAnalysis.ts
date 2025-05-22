/**
 * Utility functions for image analysis using OpenRouter API
 */

import { externalApiConfig } from "@/config/externalApiConfig";

// OpenRouter API configuration
const {
  apiKey: OPENROUTER_API_KEY,
  siteUrl: SITE_URL,
} = externalApiConfig.openRouter;

// Use ASCII version of site name for headers
const ASCII_SITE_NAME = "BiggonBondhu";

export interface OpenRouterResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?:
    | string
    | {
        message: string;
        type?: string;
        param?: string;
        code?: string;
      };
}

export interface AnalysisResult {
  visible_objects: string[];
  observation_type: string;
  is_useful: boolean;
  usefulness_reason: string;
  fun_fact: string;
  raw_response?: string;
}

/**
 * Analyzes an image using OpenRouter API
 * @param imageUrl URL of the image to analyze
 * @returns Promise with analysis results
 */
export async function analyzeImageWithAI(
  imageUrl: string
): Promise<AnalysisResult> {
  try {
    // Validate image URL
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error("Invalid image URL provided");
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

    const prompt = `You are a kind and intelligent science teacher reviewing an image submitted by a student as part of a citizen science project. Look carefully at the image and describe:

1. What is visible in the photo? (e.g., trees, insects, water, weather, trash, animals, plants, etc.)
2. What type of observation it most likely is (insect, plant, pollution, cloud, water, etc.)
3. Is the photo useful for learning science or understanding nature? Why or why not?
4. Give one fun fact or educational tip based on what you see.

Respond in simple, encouraging language suitable for a school-aged child. Be clear, kind, and motivating.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": ASCII_SITE_NAME, // Using ASCII version to avoid encoding issues
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-vl-a3b-thinking:free",
          messages: [
            {
              role: "system",
              content: prompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please analyze this science observation image",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
        }),
        // Add a timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
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
          `ছবি বিশ্লেষণে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। (${response.status})`
        );
      }
    }

    const data: OpenRouterResponse = await response.json();

    // Improved response validation with better logging
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));

    // Check if the response has the expected structure
    if (!data) {
      throw new Error("Empty response from OpenRouter");
    }

    // Handle different response formats
    let aiResponse = "";
    if (
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message?.content
    ) {
      aiResponse = data.choices[0].message.content;
    } else if (typeof data.choices === "string") {
      // Handle potential string response
      aiResponse = data.choices;
    } else if (data.error) {
      // Handle API error response
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : data.error.message || "Unknown OpenRouter error";
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    } else {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from OpenRouter");
    }

    // Process the text response into structured data
    const analysisResult = parseAIResponse(aiResponse);

    return {
      ...analysisResult,
      raw_response: aiResponse,
    };
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw error;
  }
}

/**
 * Parse the AI's text response into structured data
 * Note: This is a simple parser - in production you might use
 * a more robust approach or even ask the AI for JSON directly
 */
function parseAIResponse(aiResponse: string): AnalysisResult {
  // Default result structure
  const result: AnalysisResult = {
    visible_objects: [],
    observation_type: "অনির্ধারিত",
    is_useful: true,
    usefulness_reason: "",
    fun_fact: "",
  };

  try {
    // Extract visible objects
    const visibleMatch = aiResponse.match(
      /What is visible.*?:(.*?)(?=\d\.|$)/is
    );
    if (visibleMatch && visibleMatch[1]) {
      result.visible_objects = visibleMatch[1]
        .split(/,|\band\b/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    } else {
      // Alternative approach - just take the first paragraph
      const firstParagraph = aiResponse.split("\n")[0];
      result.visible_objects = [firstParagraph.trim()];
    }

    // Extract observation type
    const typeMatch =
      aiResponse.match(/observation.*?is.*?:(.*?)(?=\d\.|$)/is) ||
      aiResponse.match(/type of observation.*?:(.*?)(?=\d\.|$)/is);
    if (typeMatch && typeMatch[1]) {
      result.observation_type = typeMatch[1].trim();
    }

    // Extract usefulness
    const usefulMatch = aiResponse.match(
      /Is the photo useful.*?:(.*?)(?=\d\.|$)/is
    );
    if (usefulMatch && usefulMatch[1]) {
      const usefulText = usefulMatch[1].toLowerCase().trim();
      result.is_useful =
        !usefulText.includes("not useful") && !usefulText.startsWith("no");
      result.usefulness_reason = usefulMatch[1].trim();
    }

    // Extract fun fact
    const funFactMatch =
      aiResponse.match(/fun fact.*?:(.*?)(?=$)/is) ||
      aiResponse.match(/tip.*?:(.*?)(?=$)/is) ||
      aiResponse.match(/Did you know.*?(?=$)/is);
    if (funFactMatch && funFactMatch[1]) {
      result.fun_fact = funFactMatch[1].trim();
    } else {
      // Take the last paragraph as the fun fact
      const paragraphs = aiResponse
        .split("\n")
        .filter((p) => p.trim().length > 0);
      if (paragraphs.length > 0) {
        result.fun_fact = paragraphs[paragraphs.length - 1].trim();
      }
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
    // If parsing fails, use the raw response as the fun fact
    const shortenedResponse =
      aiResponse.substring(0, 500) + (aiResponse.length > 500 ? "..." : "");
    result.fun_fact = shortenedResponse;
  }

  return result;
}
