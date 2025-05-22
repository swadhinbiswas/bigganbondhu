import {
  faAtom,
  faCirclePlay,
  faCube,
  faMicroscope,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

export default function HandsOnIndexPage() {
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4 lg:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
          হ্যান্ডস-অন এক্সপেরিয়েন্স
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
          এখানে আপনি সার্কিট ডিজাইনসহ আরও ইন্টারেক্টিভ এক্সপেরিয়েন্স পাবেন।
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 w-full">
          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/hands-on/virtual-microscope")}
          >
            <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FontAwesomeIcon
                className="text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl"
                icon={faMicroscope}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              ভার্চুয়াল মাইক্রোস্কোপ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              বিভিন্ন জীবাণু ও কোষ পর্যবেক্ষণ করুন
            </p>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/hands-on/atom-builder")}
          >
            <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FontAwesomeIcon
                className="text-red-600 dark:text-red-400 text-2xl sm:text-3xl"
                icon={faAtom}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              অ্যাটম বিল্ডার
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              ইন্টারেক্টিভ পরমাণু গঠন ও পরীক্ষা
            </p>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/hands-on/circuit")}
          >
            <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FontAwesomeIcon
                className="text-yellow-600 dark:text-yellow-400 text-2xl sm:text-3xl"
                icon={faCirclePlay}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              সার্কিট ডিজাইন
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              ইন্টারেক্টিভ সার্কিট ডিজাইন ও সিমুলেশন
            </p>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/hands-on/3d-shapes")}
          >
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FontAwesomeIcon
                className="text-green-600 dark:text-green-400 text-2xl sm:text-3xl"
                icon={faCube}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              3D আকৃতি
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              ত্রিমাত্রিক আকৃতি এবং জ্যামিতি
            </p>
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center touch-optimized-button"
            onClick={() => navigate("/hands-on/solar-system")}
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <FontAwesomeIcon
                className="text-purple-600 dark:text-purple-400 text-2xl sm:text-3xl"
                icon={faSun}
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-gray-100">
              সৌরজগৎ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              ইন্টারেক্টিভ সৌরজগৎ সিমুলেশন
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
