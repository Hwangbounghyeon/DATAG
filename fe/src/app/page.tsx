import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-200 sm:text-5xl md:text-6xl">
            <span className="block">Everything MLOps System</span>
            <span className="block text-indigo-600 mt-2">is HERE</span>
          </h1>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 hover:scale-105 transform"
            >
              Get Start
            </Link>
          </div>

          <div className="mt-16">
            <div className="relative w-full h-[400px] rounded-lg shadow-2xl overflow-hidden group">
              <Image
                src="https://picsum.photos/1080/920"
                alt="AI-powered image analysis dashboard"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      AI-Powered
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Auto-Tagging
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Intelligent Image Analysis & Management
                  </h2>
                  <p className="text-gray-200">
                    Upload your images and let our AI analyze, tag, and organize
                    them automatically
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
