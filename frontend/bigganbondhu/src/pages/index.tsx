import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { useNavigate } from "react-router-dom";

import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-4 sm:py-8 md:py-10">
        <div className="inline-block max-w-3xl text-center justify-center px-2">
          <span className={title()}>বিজ্ঞান&nbsp;</span>
          <span className={title({ color: "blue" })}>বন্ধু&nbsp;</span>
          <br />
          <span className={title()}>
            ইন্টারেক্টিভ বিজ্ঞান শিক্ষার প্ল্যাটফর্ম
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            পদার্থবিজ্ঞান, জীববিজ্ঞান এবং রসায়ন বিষয়ে ইন্টারেক্টিভ সিমুলেশন ও
            বাংলা ভাষায় অডিও ব্যাখ্যা
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 w-full max-w-6xl px-2">
          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/engines/physics")}
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">🔭</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              পদার্থবিজ্ঞান
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              প্রজেক্টাইল মোশন, পেন্ডুলাম ইত্যাদি সিমুলেশন এবং ইন্টারেক্টিভ
              পরীক্ষা
            </p>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "flat",
                class: "mt-auto text-sm sm:text-base",
              })}
            >
              অধ্যয়ন শুরু করুন
            </button>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/engines/biology")}
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">🧬</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              জীববিজ্ঞান
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              ত্রিমাত্রিক হৃদপিণ্ড, কোষ ও অন্যান্য অঙ্গ মডেল ইন্টারেক্টিভ ভাবে
              অধ্যয়ন করুন
            </p>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "flat",
                class: "mt-auto text-sm sm:text-base",
              })}
            >
              অধ্যয়ন শুরু করুন
            </button>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/engines/chemistry")}
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">⚗️</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              রসায়ন
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              ভার্চুয়াল ল্যাবে রাসায়নিক বিক্রিয়া দেখুন, বিভিন্ন রাসায়নিক যৌগ
              মিশ্রিত করে ফলাফল জানুন
            </p>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "flat",
                class: "mt-auto text-sm sm:text-base",
              })}
            >
              অধ্যয়ন শুরু করুন
            </button>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/hands-on")}
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">🛠️</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              হ্যান্ডস-অন এক্সপেরিয়েন্স
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              সার্কিট ডিজাইন, অ্যাটম বিল্ডার এবং অন্যান্য ইন্টারেক্টিভ
              এক্সপেরিয়েন্স
            </p>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "flat",
                class: "mt-auto text-sm sm:text-base",
              })}
            >
              এক্সপ্লোর করুন
            </button>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 text-center max-w-3xl px-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            বিজ্ঞান বন্ধু সম্পর্কে
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            বিজ্ঞান বন্ধু হল একটি ওয়েব-ভিত্তিক ইন্টারেক্টিভ বিজ্ঞান শিক্ষা
            প্ল্যাটফর্ম যা বাংলা ভাষায় পদার্থবিজ্ঞান, জীববিজ্ঞান ও রসায়ন
            বিষয়ে শিক্ষার্থীদের প্রদর্শন, সিমুলেশন এবং অডিও ব্যাখ্যা প্রদান
            করে। এটি শিক্ষার্থীদের বিজ্ঞান বিষয়ক ধারণা সহজভাবে বুঝতে সাহায্য
            করবে।
          </p>
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              class: "text-sm sm:text-base touch-optimized-button",
            })}
            href="/about"
          >
            আরও জানুন
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
