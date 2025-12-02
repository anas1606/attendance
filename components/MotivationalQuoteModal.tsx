'use client';

import { useEffect, useState } from 'react';

interface MotivationalQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Curated quotes from world-famous people about productivity, focus, and work
const MOTIVATIONAL_QUOTES = [
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "Action"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "Passion"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "Perseverance"
  },
  {
    quote: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
    category: "Productivity"
  },
  {
    quote: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "Action"
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "Persistence"
  },
  {
    quote: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "Focus"
  },
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    category: "Beginning"
  },
  {
    quote: "Quality is not an act, it is a habit.",
    author: "Aristotle",
    category: "Excellence"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "Belief"
  },
  {
    quote: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs",
    category: "Satisfaction"
  },
  {
    quote: "It's not about having time. It's about making time.",
    author: "Unknown",
    category: "Time Management"
  },
  {
    quote: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon",
    category: "Work Ethic"
  },
  {
    quote: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    author: "Stephen King",
    category: "Discipline"
  },
  {
    quote: "Do not wait; the time will never be 'just right.' Start where you stand.",
    author: "Napoleon Hill",
    category: "Action"
  },
  {
    quote: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
    category: "Excellence"
  },
  {
    quote: "Productivity is never an accident. It is always the result of a commitment to excellence.",
    author: "Paul J. Meyer",
    category: "Productivity"
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    category: "Beginning"
  },
  {
    quote: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
    category: "Priorities"
  },
  {
    quote: "Success usually comes to those who are too busy to be looking for it.",
    author: "Henry David Thoreau",
    category: "Success"
  }
];

export default function MotivationalQuoteModal({ isOpen, onClose }: MotivationalQuoteModalProps) {
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Select a random quote when modal opens
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote(randomQuote);
      
      // Trigger animation
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl transform transition-all duration-500 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Card */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Header Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500"></div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group hover:scale-110 z-10"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="p-8 sm:p-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Daily Inspiration
            </h3>
            
            {/* Category Badge */}
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-xs font-semibold text-purple-700 border border-purple-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {quote.category}
              </span>
            </div>

            {/* Quote */}
            <div className="relative mb-8">
              {/* Opening Quote Mark */}
              <div className="absolute -top-4 -left-2 text-6xl text-gradient-to-br from-purple-300 to-blue-300 opacity-40 font-serif leading-none">"</div>
              
              <blockquote className="relative text-center text-xl sm:text-2xl font-medium text-gray-800 leading-relaxed italic px-4">
                {quote.quote}
              </blockquote>
              
              {/* Closing Quote Mark */}
              <div className="absolute -bottom-8 -right-2 text-6xl text-gradient-to-br from-purple-300 to-blue-300 opacity-40 font-serif leading-none">"</div>
            </div>

            {/* Author */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
                — {quote.author}
              </p>
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleClose}
                className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Let's Get Started!
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Bottom Decorative Element */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500"></div>
        </div>
      </div>
    </div>
  );
}

