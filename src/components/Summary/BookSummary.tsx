import { useState } from 'react';
import { Summary } from '@/types';

interface BookSummaryProps {
  bookId: string;
  currentPosition: number;
  className?: string;
}

export function BookSummary({
  bookId,
  currentPosition,
  className = ''
}: BookSummaryProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/books/${bookId}/summary?position=${currentPosition}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Story So Far</h2>

      {!summary && !loading && (
        <button
          onClick={fetchSummary}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Summary
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          Error: {error}
        </div>
      )}

      {summary && (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{summary.content}</p>
          <div className="text-sm text-gray-500 mt-4">
            Last updated: {new Date(summary.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
} 