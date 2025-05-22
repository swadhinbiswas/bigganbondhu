import DefaultLayout from "@/layouts/default";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function UsageGuidePage() {
  return (
    <DefaultLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            ব্যবহার নির্দেশিকা
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            বিজ্ঞানবন্ধু ওয়েবসাইট ব্যবহারের সম্পূর্ণ গাইড
          </p>
        </div>

        {/* Site Navigation Guide */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 mb-8 border border-emerald-100 dark:border-emerald-800/30">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
            সাইট ব্যবহারের সাধারণ নির্দেশনা
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-200">
                সাইটের মূল বিভাগসমূহ
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">হোম পেজ:</span> সাইটের প্রধান
                  পাতা যেখানে সকল বিভাগের সংক্ষিপ্ত বিবরণ পাবেন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">পদার্থবিজ্ঞান:</span>{" "}
                  পদার্থবিজ্ঞান সম্পর্কিত ইন্টারেক্টিভ অধ্যায়, সিমুলেশন এবং
                  কুইজ।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">জীববিজ্ঞান:</span> জীববিজ্ঞানের
                  বিভিন্ন বিষয়, ৩ডি মডেল এবং ইন্টারেক্টিভ অ্যানিমেশন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">রসায়ন:</span> রসায়ন বিষয়ক
                  ইন্টারেক্টিভ পরীক্ষা, মলিকিউলার মডেল এবং শিক্ষামূলক গেম।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">ক্ষুদ্র গবেষণা:</span> AI
                  ভিত্তিক বিজ্ঞান সহায়তা যেখানে আপনি বিজ্ঞান সম্পর্কিত প্রশ্ন
                  জিজ্ঞাসা করতে পারেন।
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2 mt-4 text-gray-800 dark:text-gray-200">
                সাইট নেভিগেশন
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">নেভিগেশন বার:</span> পেজের উপরে
                  অবস্থিত মেনু ব্যবহার করে বিভিন্ন বিভাগে যেতে পারেন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">থিম সুইচ:</span> উপরের ডান দিকে
                  থাকা সুইচ ব্যবহার করে লাইট/ডার্ক মোড পরিবর্তন করতে পারেন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">ফুটার লিংক:</span> পেজের নিচে
                  আমাদের সম্পর্কে, নির্দেশিকা এবং যোগাযোগের লিংক পাবেন।
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2 mt-4 text-gray-800 dark:text-gray-200">
                ইন্টারেক্টিভ কন্টেন্ট ব্যবহার
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">সিমুলেশন:</span> সিমুলেশনগুলো
                  ব্যবহার করতে স্ক্রিনে দেওয়া পরিবর্তনযোগ্য প্যারামিটার সমন্বয়
                  করুন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">৩ডি মডেল:</span> ৩ডি মডেলগুলো
                  ঘুরিয়ে, জুম করে এবং বিভিন্ন অংশে ক্লিক করে বিস্তারিত দেখুন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">কুইজ:</span> প্রশ্নের উত্তর
                  দিয়ে আপনার জ্ঞান যাচাই করুন এবং ফলাফল দেখুন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">অডিও টিউটোরিয়াল:</span> শেখার
                  জন্য অডিও ব্যাখ্যা শুনতে প্লে বাটনে ক্লিক করুন।
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              ক্ষুদ্র গবেষণা ফিচার
            </h2>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ক্ষুদ্র গবেষণা ফিচারটি আপনাকে বিজ্ঞান সম্পর্কিত প্রশ্ন জিজ্ঞাসা
              করতে এবং ছবি বিশ্লেষণ করতে সাহায্য করে। এই ফিচারটি ব্যবহার করার
              নিয়মাবলী নিম্নে দেওয়া হলো:
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700 dark:text-gray-200">
              প্রশ্ন জিজ্ঞাসা করা
            </h3>

            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">প্রশ্ন লিখুন:</span> "আপনার প্রশ্ন
                এখানে লিখুন..." টেক্সট বক্সে আপনার বিজ্ঞান সম্পর্কিত প্রশ্ন
                লিখুন।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">পাঠান বাটন:</span> আপনার প্রশ্ন
                লেখা শেষ হলে "পাঠান" বাটনে ক্লিক করুন।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">উত্তর দেখুন:</span> কিছুক্ষণ
                অপেক্ষা করার পর, আপনার প্রশ্নের উত্তর "ফলাফল" বিভাগে দেখতে
                পাবেন।
              </li>
            </ol>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30 mb-6">
              <h4 className="font-medium text-lg mb-2 text-blue-700 dark:text-blue-300">
                উদাহরণ প্রশ্ন
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li className="text-gray-700 dark:text-gray-300">
                  "পানি কেন নীল দেখায়?"
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  "আলোর গতি কত?"
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  "সূর্যগ্রহণ কীভাবে ঘটে?"
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  "মানব দেহে কত হাড় আছে?"
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-8 mb-3 text-gray-700 dark:text-gray-200">
              ছবি বিশ্লেষণ করা
            </h3>

            <ol className="list-decimal pl-6 space-y-3 mb-6">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">ছবি আপলোড করুন:</span> "ছবি আপলোড
                করতে এখানে ক্লিক করুন" এ ক্লিক করে আপনার বিজ্ঞান সম্পর্কিত ছবি
                (যেমন: উদ্ভিদ, প্রাণী, প্রাকৃতিক দৃশ্য) আপলোড করুন।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">পাঠান বাটন:</span> ছবি নির্বাচন
                করার পর "পাঠান" বাটনে ক্লিক করুন।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">বিশ্লেষণ দেখুন:</span> কিছুক্ষণ
                অপেক্ষা করার পর, ছবির বিশ্লেষণ "ফলাফল" বিভাগে দেখতে পাবেন।
              </li>
            </ol>

            <h4 className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-200">
              ছবি বিশ্লেষণে আপনি পাবেন:
            </h4>

            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">ছবিতে যা দেখা যায়:</span> ছবিতে
                কী কী বস্তু বা প্রাণী দেখা যাচ্ছে তার তালিকা।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">পর্যবেক্ষণের ধরন:</span> ছবিটি কোন
                ধরনের (উদ্ভিদ, প্রাণী, পরিবেশ ইত্যাদি)।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">শিক্ষার জন্য উপযোগিতা:</span>{" "}
                ছবিটি বিজ্ঞান শিক্ষার জন্য কতটা উপযোগী তার মূল্যায়ন।
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">আকর্ষণীয় তথ্য:</span> ছবি
                সম্পর্কিত একটি মজার বা শিক্ষণীয় তথ্য।
              </li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800/30 mb-6">
              <h4 className="font-medium text-lg mb-2 text-yellow-700 dark:text-yellow-300 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                গুরুত্বপূর্ণ টিপস
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li className="text-gray-700 dark:text-gray-300">
                  শুধুমাত্র বিজ্ঞান সম্পর্কিত ছবি আপলোড করুন।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  স্পষ্ট এবং ভালো মানের ছবি ব্যবহার করলে বিশ্লেষণ আরও নির্ভুল
                  হবে।
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  কোন সমস্যা হলে "রিসেট" বাটনে ক্লিক করে আবার চেষ্টা করুন।
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Learning Tools */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-lg p-6 mb-8 border border-purple-100 dark:border-purple-800/30">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-300">
            ইন্টারেক্টিভ লার্নিং টুলস
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-xl font-medium mb-2 text-purple-600 dark:text-purple-400">
                ভার্চুয়াল ল্যাব সিমুলেশন
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                বিভিন্ন পরীক্ষা-নিরীক্ষা ভার্চুয়াল উপায়ে সম্পন্ন করুন।
                প্যারামিটার পরিবর্তন করে ফলাফল দেখুন।
              </p>
              <Link
                to="/engines/physics/simulations"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                আরও জানুন →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-xl font-medium mb-2 text-purple-600 dark:text-purple-400">
                ৩ডি মডেল ইন্টারেকশন
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                জটিল বিজ্ঞান ধারণাগুলো বুঝতে ইন্টারেক্টিভ ৩ডি মডেল ব্যবহার করুন।
              </p>
              <Link
                to="/engines/biology/models"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                আরও জানুন →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-xl font-medium mb-2 text-purple-600 dark:text-purple-400">
                কুইজ এবং প্রতিযোগিতা
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                আপনার জ্ঞান যাচাই করতে কুইজ নিন এবং অন্যদের সাথে প্রতিযোগিতা
                করুন।
              </p>
              <Link
                to="/quiz"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                আরও জানুন →
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-xl font-medium mb-2 text-purple-600 dark:text-purple-400">
                অডিও ব্যাখ্যা
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                টেক্সট থেকে স্পিচ প্রযুক্তি ব্যবহার করে বিজ্ঞান বিষয়ক ব্যাখ্যা
                শুনুন।
              </p>
              <Link
                to="/audio-explanations"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                আরও জানুন →
              </Link>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-200">
            সাধারণ সমস্যা ও সমাধান
          </h3>

          <div className="space-y-4 mb-6">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ১. "API configuration error" দেখাচ্ছে
              </p>
              <p className="text-gray-700 dark:text-gray-300 pl-5">
                সমাধান: সাইট অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ২. ছবি আপলোড হচ্ছে না
              </p>
              <p className="text-gray-700 dark:text-gray-300 pl-5">
                সমাধান: ছবির ফরম্যাট (JPEG, PNG, GIF, WEBP) ঠিক আছে কিনা চেক
                করুন এবং ছবির সাইজ 5MB এর কম কিনা নিশ্চিত করুন।
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ৩. উত্তর আসতে অনেক সময় লাগছে
              </p>
              <p className="text-gray-700 dark:text-gray-300 pl-5">
                সমাধান: আপনার ইন্টারনেট সংযোগ চেক করুন। সার্ভার ব্যস্ত থাকলে
                কিছুক্ষণ পর আবার চেষ্টা করুন।
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ৪. ৩ডি মডেল লোড হচ্ছে না
              </p>
              <p className="text-gray-700 dark:text-gray-300 pl-5">
                সমাধান: আপনার ব্রাউজার আপডেট করুন। Google Chrome, Firefox, বা
                Safari এর সর্বশেষ সংস্করণ ব্যবহার করুন।
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ৫. অডিও শোনা যাচ্ছে না
              </p>
              <p className="text-gray-700 dark:text-gray-300 pl-5">
                সমাধান: আপনার ডিভাইসে ভলিউম চেক করুন। ব্রাউজারে অডিও প্লে করার
                অনুমতি দিয়েছেন কিনা নিশ্চিত করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <Link
            to="/small-research"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ক্ষুদ্র গবেষণা পেজে যান
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            হোম পেজে ফিরে যান
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 mb-4">
          <p>
            আমাদের নির্দেশিকা সম্পর্কে আপনার মতামত জানাতে চাইলে আমাদের সাথে
            যোগাযোগ করুন।
          </p>
        </div>
      </motion.div>
    </DefaultLayout>
  );
}
