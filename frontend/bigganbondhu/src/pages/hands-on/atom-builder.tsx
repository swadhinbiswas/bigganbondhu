import AtomBuilder from "@/components/chemistry/AtomBuilder";
import DefaultLayout from "@/layouts/default";

export default function HandsOnAtomBuilderPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          ইন্টারেক্টিভ অ্যাটম বিল্ডার
        </h1>

        <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">শেখার উদ্দেশ্য</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>পরমাণুর গঠন বোঝা: প্রোটন, নিউট্রন এবং ইলেকট্রন</li>
            <li>প্রোটনের সংখ্যা কীভাবে মৌলের ধরন নির্ধারণ করে তা জানা</li>
            <li>নিউক্লিয়াসের চারপাশে ইলেকট্রনের শেল বিন্যাস অন্বেষণ করা</li>
            <li>
              কণাগুলির ভারসাম্য কীভাবে স্থায়িত্ব এবং আয়নিক চার্জ প্রভাবিত করে
              তা আবিষ্কার করা
            </li>
            <li>অরবিটাল মডেল এবং ইলেকট্রন ক্লাউড মডেলের মধ্যে রূপান্তর দেখা</li>
          </ul>
        </div>

        <AtomBuilder />
      </div>
    </DefaultLayout>
  );
}
