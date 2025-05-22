import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 flex-grow pt-16 pb-8 overflow-x-hidden">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3 px-2 sm:px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-full">
          <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm sm:text-base">
            বিজ্ঞান
            <span className="text-emerald-600 dark:text-emerald-500">
              বন্ধু
            </span>{" "}
            - ইন্টারেক্টিভ বিজ্ঞান শিক্ষার প্ল্যাটফর্ম &copy;{" "}
            {new Date().getFullYear()}
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
            <Link
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 touch-optimized-button"
              href="/about"
            >
              আমাদের সম্পর্কে
            </Link>
            <Link
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 touch-optimized-button"
              href="/usage-guide"
            >
              নির্দেশিকা
            </Link>
            <Link
              isExternal
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 touch-optimized-button"
              href="mailto:info@bigganbondhu.org"
            >
              যোগাযোগ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
