'use client';

import { useState, useEffect } from 'react';

type LoadingBookProps = {
  message?: string;
};

export default function LoadingBook({ message = 'Loading your bookshelf...' }: LoadingBookProps) {
  const [progress, setProgress] = useState(0);
  const [bookQuote, setBookQuote] = useState('');
  
  const bookQuotes = [
    "So many books, so little time.",
    "A room without books is like a body without a soul.",
    "Good books don't give up all their secrets at once.",
    "Reading is a conversation. All books talk, but a good book listens as well.",
    "Books are a uniquely portable magic.",
    "You can never get a cup of tea large enough or a book long enough to suit me.",
    "Reading brings us unknown friends.",
    "A book is a dream that you hold in your hand.",
    "There is no friend as loyal as a book.",
    "The best books... are those that tell you what you know already."
  ];

  useEffect(() => {
    // Set a random book quote
    const randomQuote = bookQuotes[Math.floor(Math.random() * bookQuotes.length)];
    setBookQuote(randomQuote);
    
    // Create a realistic loading simulation
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        // Slow down as we approach 100%
        const increment = 100 - oldProgress > 30 ? 10 : 5;
        const newProgress = Math.min(oldProgress + increment/10, 99);
        return newProgress;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
      <div className="w-28 h-36 relative mb-6 transform-gpu animate-pulse">
        {/* Book cover */}
        <div className="absolute inset-0 bg-teal-700 rounded-r-md rounded-l-sm shadow-lg flex items-center justify-center">
          <span className="text-white text-2xl">📚</span>
        </div>
        {/* Book pages */}
        <div className="absolute top-1 bottom-1 right-0 w-1 bg-white opacity-70"></div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
        <div 
          className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <p className="text-gray-600 italic mt-4">"{bookQuote}"</p>
    </div>
  );
}
