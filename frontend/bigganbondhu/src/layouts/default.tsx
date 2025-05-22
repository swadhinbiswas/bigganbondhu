import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            বিজ্ঞান
            <span className="text-emerald-600 dark:text-emerald-500">
              বন্ধু
            </span>{" "}
            - ইন্টারেক্টিভ বিজ্ঞান শিক্ষার প্ল্যাটফর্ম &copy;{" "}
            {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/about"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              আমাদের সম্পর্কে
            </Link>
            <Link
              href="/usage-guide"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              নির্দেশিকা
            </Link>
            <Link
              isExternal
              href="mailto:info@bigganbondhu.org"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              যোগাযোগ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
