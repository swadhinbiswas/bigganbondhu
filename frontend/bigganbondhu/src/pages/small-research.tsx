import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import DefaultLayout from "@/layouts/default";
import { AnalysisResult, analyzeImageWithAI } from "@/utils/imageAnalysis";
import { uploadImage } from "@/utils/imageUpload";
import { queryAI } from "@/utils/textQuery";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
  analysis?: AnalysisResult;
}

export default function SmallResearchPage() {
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "স্বাগতম! আপনি আমাকে বিজ্ঞান সম্পর্কে যেকোন প্রশ্ন জিজ্ঞেস করতে পারেন অথবা একটি ছবি আপলোড করতে পারেন যা আমি বিশ্লেষণ করে দেব।",
      timestamp: new Date(),
    },
  ]);

  // State for user input
  const [inputText, setInputText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle text input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // Handle image selection
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle key press (Enter to submit)
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (inputText.trim() || selectedImage)
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Generate a unique ID for messages
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Handle form submission (both text and image)
  const handleSubmit = async () => {
    if (isLoading || (!inputText.trim() && !selectedImage)) return;

    try {
      setIsLoading(true);
      const messageId = generateId();

      // Add user message to chat
      const userMessage: Message = {
        id: messageId,
        role: "user",
        content: inputText,
        timestamp: new Date(),
        imageUrl: previewUrl || undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");

      // Add loading message
      const loadingMessage: Message = {
        id: `loading-${messageId}`,
        role: "assistant",
        content: "অপেক্ষা করুন...",
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages((prev) => [...prev, loadingMessage]);

      // Process the message based on type (image or text)
      if (selectedImage) {
        await handleImageSubmission(messageId, loadingMessage.id);
      } else {
        await handleTextSubmission(inputText, loadingMessage.id);
      }

      // Clear image after submission
      clearSelectedImage();
    } catch (error) {
      console.error("Error in submission:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isLoading
            ? {
                ...msg,
                content: "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                isLoading: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image submission
  const handleImageSubmission = async (
    messageId: string,
    loadingId: string
  ) => {
    if (!selectedImage) return;

    try {
      // Upload image to ImgHippo
      const response = await uploadImage(selectedImage, "Science Observation");

      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }

      const imageUrl = response.data?.view_url || "";

      // Update user message with uploaded image URL
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, imageUrl } : msg))
      );

      // Call API for analysis
      const result = await analyzeImageWithAI(imageUrl);

      // Remove loading message and add analysis result
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: generateId(),
            role: "assistant",
            content: "আপনার ছবি বিশ্লেষণ করা হয়েছে:",
            timestamp: new Date(),
            analysis: result,
            imageUrl,
          })
      );
    } catch (error) {
      console.error("Image analysis error:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: "ছবি বিশ্লেষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                isLoading: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : msg
        )
      );
    }
  };

  // Handle text submission
  const handleTextSubmission = async (text: string, loadingId: string) => {
    try {
      // Call API for text response
      const result = await queryAI(text);

      // Remove loading message and add AI response
      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: generateId(),
            role: "assistant",
            content: result.answer,
            timestamp: new Date(),
          })
      );
    } catch (error) {
      console.error("Text query error:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: "প্রশ্নের উত্তর দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                isLoading: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : msg
        )
      );
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            ক্ষুদ্র গবেষণা
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            বিজ্ঞান জিজ্ঞাসা এবং ছবি বিশ্লেষণ
          </p>
        </div>

        {/* Chat container */}
        <div className="flex-grow overflow-y-auto mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-gray-100"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                  } ${message.isLoading ? "animate-pulse" : ""}`}
                >
                  {message.role === "user" && (
                    <div className="flex items-start mb-1">
                      <div className="flex-grow">
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>

                        {/* User-uploaded image */}
                        {message.imageUrl && (
                          <div className="mt-3 rounded-md overflow-hidden max-h-64 border border-blue-100 dark:border-blue-900 shadow-sm">
                            <img
                              src={message.imageUrl}
                              alt="User uploaded"
                              className="max-w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {message.role === "assistant" && !message.analysis && (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}

                  {/* Analysis results for image */}
                  {message.analysis && (
                    <div>
                      <div className="whitespace-pre-wrap mb-4">
                        {message.content}
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {/* Image being analyzed */}
                        {message.imageUrl && (
                          <div className="w-full bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <img
                              src={message.imageUrl}
                              alt="Analysis"
                              className="max-h-48 mx-auto object-contain py-2"
                            />
                          </div>
                        )}

                        {/* Image analysis results */}
                        <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                          {/* Visible objects */}
                          <div>
                            <h4 className="font-medium text-md text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                              <span className="text-emerald-600 dark:text-emerald-400 mr-2">
                                ●
                              </span>
                              ছবিতে যা দেখা যায়:
                            </h4>
                            <div className="flex flex-wrap gap-2 ml-6">
                              {message.analysis.visible_objects.map(
                                (item: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 text-sm rounded-md"
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                              {message.analysis.visible_objects.length ===
                                0 && (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  কোন তথ্য পাওয়া যায়নি
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Observation type */}
                          <div>
                            <h4 className="font-medium text-md text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                              <span className="text-blue-600 dark:text-blue-400 mr-2">
                                ●
                              </span>
                              পর্যবেক্ষণের ধরন:
                            </h4>
                            <p className="ml-6 text-gray-700 dark:text-gray-300">
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 text-sm rounded-md">
                                {message.analysis.observation_type ||
                                  "অনির্ধারিত"}
                              </span>
                            </p>
                          </div>

                          {/* Usefulness */}
                          <div>
                            <h4 className="font-medium text-md text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                              <span className="text-purple-600 dark:text-purple-400 mr-2">
                                ●
                              </span>
                              শিক্ষার জন্য উপযোগিতা:
                            </h4>
                            <div className="ml-6">
                              {message.analysis.is_useful ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                  উপযোগী
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-sm">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    ></path>
                                  </svg>
                                  তেমন উপযোগী নয়
                                </span>
                              )}
                              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                {message.analysis.usefulness_reason || ""}
                              </p>
                            </div>
                          </div>

                          {/* Fun fact */}
                          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                            <h4 className="font-medium text-md text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-amber-500 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              আকর্ষণীয় তথ্য:
                            </h4>
                            <p className="ml-7 text-gray-700 dark:text-gray-300 italic">
                              "
                              {message.analysis.fun_fact ||
                                "কোন তথ্য পাওয়া যায়নি"}
                              "
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error message */}
                  {message.error && (
                    <div className="mt-3 bg-red-50 dark:bg-red-900/20 p-2 rounded-md text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                      <span className="font-medium">Error:</span>{" "}
                      {message.error}
                    </div>
                  )}

                  {/* Message timestamp */}
                  <div
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-right text-gray-600 dark:text-gray-400"
                        : "text-left text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {new Intl.DateTimeFormat("bn-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <div className="relative">
            {/* Selected image preview */}
            {previewUrl && (
              <div className="absolute bottom-full mb-3 left-0 right-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 p-2 flex items-center gap-3 border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="h-20 w-20 relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-md"
                  />
                  <button
                    onClick={clearSelectedImage}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
                    type="button"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                    ছবি সংযুক্ত করা হয়েছে
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedImage?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Input form */}
            <div className="flex items-end gap-2">
              <Input
                ref={textInputRef}
                placeholder="আপনার প্রশ্ন লিখুন অথবা একটি ছবি সংযুক্ত করুন..."
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="flex-grow bg-gray-100 dark:bg-gray-900"
                disabled={isLoading}
                size="lg"
                endContent={
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    disabled={isLoading}
                    type="button"
                    aria-label="Upload image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                color="primary"
                onClick={handleSubmit}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                isLoading={isLoading}
                size="lg"
                className="px-4"
                aria-label="Send message"
              >
                {!isLoading && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
            বিজ্ঞান সম্পর্কে আপনার প্রশ্ন জিজ্ঞাসা করুন অথবা একটি ছবি আপলোড করে
            বিশ্লেষণ পান।
            <br />
            <span className="text-blue-500 dark:text-blue-400 font-medium">
              সম্পূর্ণ বাংলায় প্রশ্ন করতে পারেন!
            </span>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
