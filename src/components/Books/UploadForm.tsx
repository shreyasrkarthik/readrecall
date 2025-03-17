'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { getAppTheme } from '@/lib/colors';

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appTheme = getAppTheme();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/epub+zip') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid EPUB file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload book');
      }

      const book = await response.json();
      router.push(`/books/${book.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex w-full items-center justify-center">
        <label
          htmlFor="file-upload"
          className="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          <div className="space-y-2 text-center">
            <ArrowUpTrayIcon className={`mx-auto h-12 w-12 ${appTheme.light}`} />
            <div className="text-sm text-gray-600">
              <span className={`font-medium ${appTheme.primary} group-hover:${appTheme.hover.replace('hover:', '')}`}>
                Click to upload
              </span>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500">EPUB files only</p>
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".epub"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {file && (
        <div className={`rounded-md bg-opacity-10 p-4 ${appTheme.primary.replace('text-', 'bg-')}`}>
          <div className="flex">
            <div className={`flex-1 text-sm ${appTheme.primary}`}>
              Selected file: {file.name}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-1 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        className={`w-full rounded-md ${appTheme.gradient} px-4 py-2 text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {uploading ? 'Uploading...' : 'Upload Book'}
      </button>
    </form>
  );
} 