import DefaultLayout from "@/layouts/default";
import {
  faAtom,
  faCirclePlay,
  faCube,
  faMicroscope,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

export default function HandsOnIndexPage() {
  const navigate = useNavigate();
  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto py-8 px-2">
        <h1 className="text-3xl font-bold mb-2 text-center">
          হ্যান্ডস-অন এক্সপেরিয়েন্স
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          এখানে আপনি সার্কিট ডিজাইনসহ আরও ইন্টারেক্টিভ এক্সপেরিয়েন্স পাবেন।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 w-full">
          <div
            onClick={() => navigate("/hands-on/virtual-microscope")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faMicroscope}
                className="text-blue-600 dark:text-blue-400 text-3xl"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              ভার্চুয়াল মাইক্রোস্কোপ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              বিভিন্ন জীবাণু ও কোষ পর্যবেক্ষণ করুন
            </p>
          </div>

          <div
            onClick={() => navigate("/hands-on/atom-builder")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faAtom}
                className="text-red-600 dark:text-red-400 text-3xl"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              অ্যাটম বিল্ডার
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ইন্টারেক্টিভ পরমাণু গঠন ও পরীক্ষা
            </p>
          </div>

          <div
            onClick={() => navigate("/hands-on/circuit")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faCirclePlay}
                className="text-yellow-600 dark:text-yellow-400 text-3xl"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              সার্কিট ডিজাইন
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ইন্টারেক্টিভ সার্কিট ডিজাইন ও সিমুলেশন
            </p>
          </div>

          <div
            onClick={() => navigate("/hands-on/3d-shapes")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faCube}
                className="text-green-600 dark:text-green-400 text-3xl"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              3D আকৃতি
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ত্রিমাত্রিক আকৃতি এবং জ্যামিতি
            </p>
          </div>

          <div
            onClick={() => navigate("/hands-on/solar-system")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faSun}
                className="text-purple-600 dark:text-purple-400 text-3xl"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              সৌরজগৎ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ইন্টারেক্টিভ সৌরজগৎ সিমুলেশন
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
