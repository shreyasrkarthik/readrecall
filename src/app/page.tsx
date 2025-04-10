import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { getAppTheme, getButtonStyle } from '@/lib/colors';
import FeatureSliderWrapper from '@/components/Home/FeatureSliderWrapper';

export default async function Home() {
  const session = await getServerSession();
  const appTheme = getAppTheme();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 bg-white">
      <div className="text-center max-w-3xl mx-auto px-4 mt-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900">
          Smart summaries that stop at your bookmark
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          ReadRecall helps you remember what happened in your books by providing AI-generated summaries and character information, limited to what you've read so far.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/books"
            className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold leading-6 text-teal-600 hover:text-teal-700"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Use the FeatureSliderWrapper component */}
      <FeatureSliderWrapper />
      
      {/* Add a testimonial section for additional visual interest */}
      <div className="w-full max-w-4xl mx-auto mt-20 px-4 mb-12">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <svg className="h-10 w-10 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"/>
              </svg>
            </div>
            <blockquote className="mb-6">
              <p className="text-xl font-medium text-gray-900">
                "ReadRecall has transformed how I enjoy books. The AI summaries help me pick up exactly where I left off, even after weeks away from a story."
              </p>
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-white"></div>
              <div className="ml-3 text-left">
                <p className="font-medium text-gray-900">Alex Morgan</p>
                <p className="text-sm text-gray-600">Avid Reader</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
