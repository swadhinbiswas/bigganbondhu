import DefaultLayout from "@/layouts/default";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <DefaultLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            বিজ্ঞানবন্ধু - বাংলায় বিজ্ঞান শিক্ষার ডিজিটাল প্ল্যাটফর্ম
          </p>
        </div>

        {/* Project Overview */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 mb-8 border border-emerald-100 dark:border-emerald-800/30">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
            প্রকল্প পরিচিতি
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            বিজ্ঞানবন্ধু হল একটি ইন্টারেক্টিভ বিজ্ঞান শিক্ষা প্ল্যাটফর্ম যা
            বাংলাভাষী শিক্ষার্থীদের জন্য বিজ্ঞান শেখার প্রক্রিয়াকে আকর্ষণীয় ও
            সহজবোধ্য করে তোলার লক্ষ্যে তৈরি করা হয়েছে। এই প্ল্যাটফর্মে ৩ডি
            মডেল, ইন্টারেক্টিভ সিমুলেশন, কুইজ, এবং AI-ভিত্তিক শিক্ষা সহায়তা
            রয়েছে।
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            আমাদের মূল লক্ষ্য হল বাংলাভাষী শিক্ষার্থীদের বিজ্ঞান বিষয়ক জটিল
            ধারণাগুলো সহজে বুঝতে সাহায্য করা এবং তাদের মধ্যে বিজ্ঞান শিক্ষার
            প্রতি আগ্রহ বাড়ানো। এই প্ল্যাটফর্মটি বিশেষভাবে মাধ্যমিক ও উচ্চ
            মাধ্যমিক স্তরের শিক্ষার্থীদের জন্য ডিজাইন করা হয়েছে।
          </p>
        </div>

        {/* Creator Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-emerald-500 dark:border-emerald-400 flex-shrink-0">
              <img
                src="https://avatars.githubusercontent.com/u/144092840?v=4"
                alt="Swadhin Biswas"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white text-center md:text-left">
                স্বাধীন বিশ্বাস{" "}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (@swadhinbiswas)
                </span>
              </h2>
              <h3 className="text-lg font-medium mb-4 text-emerald-600 dark:text-emerald-400 text-center md:text-left">
                প্রকল্প উদ্যোক্তা ও প্রধান উন্নয়নকারী
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                স্বাধীন বিশ্বাস একজন জিজ্ঞাসু প্রকৃতির প্রোগ্রামার, ব্যাক-এন্ড
                ডেভেলপার ও ডেটা সায়েন্স এনথুসিয়াস্ট। পাইথন, জাভাস্ক্রিপ্ট,
                C/C++, জাভা এবং মোজো ভাষায় দক্ষতা রাখেন। বিশেষ দক্ষতার
                ক্ষেত্রগুলো হচ্ছে পাইথন ব্যাকএন্ড ডেভেলপমেন্ট, ডেস্কটপ
                অ্যাপ্লিকেশন, ডেটা অ্যানালিসিস, ওয়েব অ্যাপ্লিকেশন উন্নয়ন।
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                বর্তমানে তিনি ডেটা সায়েন্স, এআই এবং সফটওয়্যার ইঞ্জিনিয়ারিং
                নিয়ে অধ্যয়নরত এবং ওপেন সোর্স প্রজেক্টে অবদান রাখতে আগ্রহী।
                বিজ্ঞানবন্ধু প্রকল্পের মাধ্যমে তিনি বাংলাভাষী শিক্ষার্থীদের জন্য
                আধুনিক প্রযুক্তির সাহায্যে বিজ্ঞান শিক্ষাকে সহজবোধ্য ও আকর্ষণীয়
                করে তুলতে প্রতিজ্ঞাবদ্ধ।
              </p>

              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                <a
                  href="https://github.com/swadhinbiswas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/swadh1n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="mailto:swadhinbiswas.cse@gmail.com"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  ইমেইল
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl shadow-lg p-6 mb-8 border border-indigo-100 dark:border-indigo-800/30">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300">
            প্রযুক্তি স্ট্যাক
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-3 text-indigo-600 dark:text-indigo-400">
                ফ্রন্টএন্ড
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  React.js এবং TypeScript
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  JavaScript
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Tailwind CSS
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Framer Motion (অ্যানিমেশন)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3 text-indigo-600 dark:text-indigo-400">
                ব্যাকএন্ড
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Python
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  FastAPI
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  gTTS (টেক্সট-টু-স্পিচ)
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  SQLite ডাটাবেস
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Vision and Mission */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-lg p-6 mb-8 border border-amber-100 dark:border-amber-800/30">
          <h2 className="text-2xl font-semibold mb-4 text-amber-700 dark:text-amber-300">
            আমাদের লক্ষ্য ও উদ্দেশ্য
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2 text-amber-600 dark:text-amber-400">
                ভিশন
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                বাংলাভাষী শিক্ষার্থীদের জন্য বিশ্বমানের বিজ্ঞান শিক্ষা সম্পদ
                সরবরাহ করা এবং ডিজিটাল মাধ্যমে বিজ্ঞান শিক্ষাকে সর্বজনীন করা।
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2 text-amber-600 dark:text-amber-400">
                মিশন
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  ইন্টারেক্টিভ ও আকর্ষণীয় উপায়ে বিজ্ঞান শিক্ষার সুযোগ তৈরি করা
                </li>
                <li>
                  শিক্ষার্থীদের মধ্যে বিজ্ঞান সম্পর্কে কৌতূহল ও আগ্রহ জাগ্রত করা
                </li>
                <li>সকল শিক্ষার্থীর জন্য উচ্চমানের শিক্ষা উপকরণ সহজলভ্য করা</li>
                <li>ডিজিটাল শিক্ষা প্রযুক্তির মাধ্যমে শিক্ষার ব্যবধান কমানো</li>
                <li>
                  শিক্ষক ও শিক্ষার্থীদের জন্য ব্যবহারবান্ধব শিক্ষা প্ল্যাটফর্ম
                  নির্মাণ করা
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact and Support */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            যোগাযোগ ও সহযোগিতা
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              বিজ্ঞানবন্ধু প্রকল্প সম্পর্কে আরও জানতে, সাহায্য পেতে, অথবা
              সহযোগিতা করতে আমাদের সাথে যোগাযোগ করুন।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <a
                href="mailto:swadhinbiswas.cse@gmail.com"
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    ইমেইল
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    swadhinbiswas.cse@gmail.com
                  </div>
                </div>
              </a>

              <a
                href="https://github.com/swadhinbiswas/bigganbondhu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    GitHub
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    প্রকল্পে অবদান রাখুন
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
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

          <Link
            to="/usage-guide"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ব্যবহার নির্দেশিকা দেখুন
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
        </div>
      </motion.div>
    </DefaultLayout>
  );
}
