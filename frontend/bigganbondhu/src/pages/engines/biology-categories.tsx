import { button as buttonStyles } from "@heroui/theme";
import { useNavigate } from "react-router-dom";

import { subtitle, title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function BiologyCategories() {
  const navigate = useNavigate();

  const categories = [
    {
      id: "introduction",
      emoji: "🔬",
      titleBn: "জীবন বিজ্ঞান পরিচিতি",
      titleEn: "Introduction to Life Science",
      descriptionBn:
        "জীবের মৌলিক গঠন, কোষ এবং তাদের কার্যকারিতা সম্পর্কে পরিচিতি",
      descriptionEn: "Basic structures of life, cells, and their functions",
      path: "/engines/biology/introduction",
    },
    {
      id: "systems",
      emoji: "🫀",
      titleBn: "জৈবিক সিস্টেম ও প্রক্রিয়া",
      titleEn: "Systems & Processes",
      descriptionBn:
        "মানব দেহের বিভিন্ন সিস্টেম, রক্ত সঞ্চালন এবং শ্বসন প্রক্রিয়া",
      descriptionEn:
        "Human body systems, circulation and respiration processes",
      path: "/engines/biology/systems",
    },
    {
      id: "advanced",
      emoji: "🧬",
      titleBn: "উন্নত ধারণাসমূহ",
      titleEn: "Advanced Concepts",
      descriptionBn:
        "জেনেটিক্স, আণবিক জীববিজ্ঞান, এবং প্রাণীদের বিবর্তন সম্পর্কে জটিল বিষয়সমূহ",
      descriptionEn: "Genetics, molecular biology, and evolution of species",
      path: "/engines/biology/advanced",
    },
  ];

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-3xl text-center justify-center">
          <span className={title()}>জীববিজ্ঞান&nbsp;</span>
          <span className={title({ color: "blue" })}>বিভাগসমূহ&nbsp;</span>
          <br />
          <span className={subtitle()}>Biology Categories</span>
          <div className={subtitle({ class: "mt-4" })}>
            আপনার পছন্দের বিভাগে ক্লিক করে জীববিজ্ঞানের বিভিন্ন দিক নিয়ে জানুন
            <br />
            <span className="text-gray-500">
              Click on a category to learn about different aspects of biology
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-5xl">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(category.path)}
              className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center text-center"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
                <span className="text-4xl">{category.emoji}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 dark:text-gray-100">
                {category.titleBn}
              </h2>
              <h3 className="text-md text-gray-500 mb-2">{category.titleEn}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {category.descriptionBn}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {category.descriptionEn}
              </p>
              <button
                className={buttonStyles({
                  color: "primary",
                  radius: "full",
                  variant: "flat",
                  class: "mt-4",
                })}
              >
                অধ্যয়ন শুরু করুন
              </button>
            </div>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
