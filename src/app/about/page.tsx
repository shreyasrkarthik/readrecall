import { getAppTheme } from '@/lib/colors';
import Image from 'next/image';

export default function AboutPage() {
  const appTheme = getAppTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">About ReadRecall</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              ReadRecall was born from a simple observation: readers often struggle to remember what happened in books when they pick them up after a break.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Our mission is to enhance the reading experience by providing smart, contextual summaries that stop exactly where you left off — no spoilers, just the perfect refresher to get you back into your book.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're juggling multiple books, taking a break between chapters, or simply want to better recall what you've read, ReadRecall is designed to make your reading journey more enjoyable and connected.
            </p>
          </div>
        </div>

        {/* Our Story section */}
        <div className="mb-20">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0 md:w-1/3 relative h-64 md:h-auto">
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <svg className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="p-8">
                <h2 className={`text-2xl font-bold mb-4 ${appTheme.primary}`}>Our Story</h2>
                <p className="text-gray-700 mb-4">
                  ReadRecall started as a personal project by a group of avid readers who were frustrated with losing track of characters and plot points when returning to books after a break. We found that existing summaries either contained spoilers or weren't tailored to where we had stopped reading.
                </p>
                <p className="text-gray-700 mb-4">
                  We built ReadRecall to solve this problem using AI technology that understands narrative structure and can generate summaries that are both informative and spoiler-free. Our platform is designed to respect the reading experience while enhancing it with helpful context when you need it.
                </p>
                <p className="text-gray-700">
                  Today, we're proud to offer a tool that helps readers maintain their connection to stories, even when life gets in the way of consistent reading habits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features sections */}
        <div className="space-y-16">
          {/* Upload Books section */}
          <section id="upload-books" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex flex-row-reverse">
                <div className="md:flex-shrink-0 md:w-2/5 relative h-64 md:h-auto">
                  <div className="absolute inset-0 bg-black flex items-center justify-center p-8">
                    <svg className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                </div>
                <div className="p-8 md:w-3/5">
                  <h2 className={`text-2xl font-bold mb-4 ${appTheme.primary}`}>Upload Your Books</h2>
                  <p className="text-gray-700 mb-4">
                    ReadRecall makes it easy to build your digital library. Simply upload your EPUB books to our secure platform, and we'll handle the rest. Your books are processed and analyzed to enable our smart summary features.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Don't have books to upload? No problem! We offer a curated collection of public domain classics that you can add to your library with a single click. From Jane Austen to H.G. Wells, discover or rediscover literary masterpieces with the added benefit of our intelligent summaries.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Your uploaded books are stored securely and are only accessible to you. We respect your privacy and the copyright of the materials you upload, ensuring a safe and legal reading experience.
                  </p>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Key Benefits:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Easy EPUB upload process</li>
                      <li>Access to public domain classics</li>
                      <li>Secure storage of your digital library</li>
                      <li>Seamless integration with our summary features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Track Characters section */}
          <section id="track-characters" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-2/5 relative h-64 md:h-auto">
                  <div className="absolute inset-0 bg-black flex items-center justify-center p-8">
                    <svg className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
                <div className="p-8 md:w-3/5">
                  <h2 className={`text-2xl font-bold mb-4 ${appTheme.primary}`}>Track Characters</h2>
                  <p className="text-gray-700 mb-4">
                    One of the most challenging aspects of reading complex novels is keeping track of the characters and their relationships. ReadRecall's character tracking feature solves this problem by providing dynamic character profiles that evolve as you read.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Our AI analyzes the text to identify characters and their relationships, creating profiles that include only information you've encountered so far in your reading. This means you can refresh your memory about a character without spoiling future developments.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Whether you're reading a sprawling fantasy epic with dozens of characters or a literary novel with complex character development, our character tracking makes it easy to stay engaged with the story.
                  </p>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Key Benefits:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Spoiler-free character profiles</li>
                      <li>Relationship mapping between characters</li>
                      <li>Character development tracking as you read</li>
                      <li>Quick reference for complex narratives</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Get Summaries section */}
          <section id="get-summaries" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex flex-row-reverse">
                <div className="md:flex-shrink-0 md:w-2/5 relative h-64 md:h-auto">
                  <div className="absolute inset-0 bg-black flex items-center justify-center p-8">
                    <svg className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                </div>
                <div className="p-8 md:w-3/5">
                  <h2 className={`text-2xl font-bold mb-4 ${appTheme.primary}`}>Get Summaries</h2>
                  <p className="text-gray-700 mb-4">
                    ReadRecall's core feature is our innovative AI-powered summary system. Unlike traditional book summaries that cover the entire plot, our summaries are dynamically generated based on your current reading progress.
                  </p>
                  <p className="text-gray-700 mb-4">
                    When you return to a book after a break, simply request a summary up to your current bookmark. Our AI will generate a concise recap of key events, character developments, and important plot points—without revealing anything you haven't read yet.
                  </p>
                  <p className="text-gray-700 mb-4">
                    These summaries are perfect for picking up where you left off, helping you quickly re-immerse yourself in the story without the frustration of forgetting important details or the risk of encountering spoilers.
                  </p>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Key Benefits:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Bookmark-aware, spoiler-free summaries</li>
                      <li>Adjustable detail levels for quick or in-depth recaps</li>
                      <li>Focus on plot points, themes, or character development</li>
                      <li>Perfect for resuming reading after breaks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Future Plans section */}
        <div className="mt-16">
          <h2 className={`text-2xl font-bold mb-6 text-center ${appTheme.primary}`}>
            Our Vision for the Future
          </h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <p className="text-gray-700 mb-6">
              ReadRecall is constantly evolving to better serve readers. Our roadmap includes several exciting features that will further enhance your reading experience:
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${appTheme.primary}`}>Reading Insights</h3>
                <p className="text-gray-700">
                  Personalized analytics about your reading habits, preferences, and patterns to help you better understand your relationship with books.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${appTheme.primary}`}>Reading Groups</h3>
                <p className="text-gray-700">
                  Create or join reading groups to discuss books, share insights, and coordinate reading progress with friends or book clubs.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${appTheme.primary}`}>Reading Scheduler</h3>
                <p className="text-gray-700">
                  Set reading goals and schedules with smart reminders to help you maintain consistent reading habits and finish more books.
                </p>
              </div>
            </div>
            <p className="text-gray-700 mt-8 text-center">
              We're committed to making ReadRecall the ultimate companion for readers, enhancing the joy of reading while respecting the integrity of the stories you love.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 