import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3 border-t">
        <div className="text-center">
          <p className="text-default-600 mb-1">
            বিজ্ঞান<span className="text-blue-600">বন্ধু</span> - ইন্টারেক্টিভ বিজ্ঞান শিক্ষার প্ল্যাটফর্ম &copy; {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/about" className="text-sm text-default-500 hover:text-blue-600">
              আমাদের সম্পর্কে
            </Link>
            <Link href="/docs" className="text-sm text-default-500 hover:text-blue-600">
              নির্দেশিকা
            </Link>
            <Link isExternal href="mailto:info@bigganbondhu.org" className="text-sm text-default-500 hover:text-blue-600">
              যোগাযোগ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

