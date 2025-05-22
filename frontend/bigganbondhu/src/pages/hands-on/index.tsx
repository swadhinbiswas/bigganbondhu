import DefaultLayout from "@/layouts/default";
import { button as buttonStyles } from "@heroui/theme";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full">
          <div
            onClick={() => navigate("/hands-on/circuit")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className=" p-2rounded-full mb-4">
              <span className="text-4xl">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5007/5007196.png"
                  alt="Atom"
                />
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              সার্কিট ডিজাইন
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              ড্র্যাগ-এন্ড-ড্রপ ইন্টারফেসে সার্কিট তৈরি করুন, ওহমের সূত্র, সিরিজ
              ও প্যারালাল সংযোগ শিখুন এবং বর্তমান প্রবাহ দেখুন।
            </p>
            <button className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
              শুরু করুন
            </button>
          </div>

          <div
            onClick={() => navigate("/hands-on/3d-shapes")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="p-2 rounded-full mb-4">
              <span className="text-4xl">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6511/6511590.png"
                  alt="3D Shapes"
                />
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              ৩ডি জ্যামিতিক আকৃতি
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              ইন্টারেক্টিভ ৩ডি জ্যামিতিক আকৃতি অ্যানিমেশন দেখুন, ঘোরান এবং অনুভব
              করুন কিভাবে ৩ডি ইফেক্ট তৈরি করা হয়।
            </p>
            <button className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
              শুরু করুন
            </button>
          </div>

          <div
            onClick={() => navigate("/engines/atom-builder")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className=" p-2 rounded-full mb-4">
              <span className="text-4xl">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4341/4341165.png"
                  alt="Atom"
                />
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              অ্যাটম বিল্ডার
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              ইন্টারেক্টিভ পারমাণবিক গঠন তৈরি করুন, প্রোটন, নিউট্রন এবং ইলেকট্রন
              যোগ করে আপনার পছন্দের পরমাণু গঠন করুন।
            </p>
            <button
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "flat",
                class: "mt-4",
              })}
            >
              শুরু করুন
            </button>
          </div>

          <div
            onClick={() => navigate("/hands-on/solar-system")}
            className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
          >
            <div className="p-2 rounded-full mb-4">
              <span className="text-4xl">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2909/2909937.png"
                  alt="Solar System"
                />
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
              সৌরজগৎ
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              ইন্টারেক্টিভ ৩ডি সৌরজগৎ দেখুন, ঘোরান এবং গ্রহগুলোর বিভিন্ন তথ্য
              জানুন। পৃথিবী ও মঙ্গল গ্রহের মধ্যে তুলনা দেখুন।
            </p>
            <button className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
              শুরু করুন
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
