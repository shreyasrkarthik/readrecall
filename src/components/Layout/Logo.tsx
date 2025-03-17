import Link from 'next/link';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        <rect width="40" height="40" rx="8" fill="black" />
        <path
          d="M10 8C10 7.44772 10.4477 7 11 7H29C29.5523 7 30 7.44772 30 8V32C30 32.5523 29.5523 33 29 33H11C10.4477 33 10 32.5523 10 32V8Z"
          fill="#0D9488"
        />
        <path
          d="M14 14H26M14 19H26M14 24H22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 12C8 11.4477 8.44772 11 9 11H13C13.5523 11 14 11.4477 14 12V28C14 28.5523 13.5523 29 13 29H9C8.44772 29 8 28.5523 8 28V12Z"
          fill="black"
        />
      </svg>
      <span className="text-xl font-bold">ReadRecall</span>
    </Link>
  );
} 