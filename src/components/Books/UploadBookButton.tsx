'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAppTheme } from '@/lib/colors';
import { useAuth } from '@/lib/context/AuthContext';

type UploadBookButtonProps = {
  allowedTypes?: string[];
  allowedExtensions?: string[];
  buttonText?: string;
  redirectPath?: string;
};

export function UploadBookButton({
  allowedTypes = ['application/pdf', 'application/epub+zip'],
  allowedExtensions = ['.pdf', '.epub'],
  buttonText = 'Upload Book',
  redirectPath = '/books'
}: UploadBookButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const appTheme = getAppTheme();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File select triggered');
    console.log('Auth state before file selection:', { isAuthenticated, isLoading, userId: user?.id });
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }
    
    console.log('Selected file:', selectedFile.name, selectedFile.type, selectedFile.size);
    
    // User is already authenticated since this component is in the profile page
    console.log('Proceeding with file upload...');
    
    if (allowedTypes.includes(selectedFile.type)) {
      console.log('File type is allowed, proceeding with upload');
      setFile(selectedFile);
      setError(null);
      await uploadFile(selectedFile);
    } else {
      console.log('File type not allowed:', selectedFile.type);
      setFile(null);
      setError(`Please select a valid file (${allowedExtensions.join(', ')})`);
    }
  };

  const uploadFile = async (bookFile: File) => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);

      // Since this component is in the profile page, user is already authenticated
      console.log('Auth state:', { isAuthenticated, isLoading, user });
      
      // Make sure we have a user ID - use email as fallback
      const userId = user?.id || user?.email || 'anonymous';
      console.log('Using userId:', userId);
      
      const fileName = bookFile.name;

      // Get presigned URL from AWS
      console.log(`Requesting presigned URL for ${bookFile.type} upload`);
      
      // For debugging purposes, ensure we have some user identifier
      // If auth isn't fully working, this ensures we still have something to use
      const userIdentifier = userId || user?.email || 'anonymous';
      console.log('Using userIdentifier for request:', userIdentifier);
      
      // Call our Next.js API proxy to get the presigned URL
      console.log('Token from useAuth():', token); // Log the token
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }

      console.log(`Requesting presigned URL via proxy for ${bookFile.type} upload`);
      const presignedUrlResponse = await fetch(
        '/api/proxy/books/upload-url', // Using the proxy endpoint
        {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            user_id: userIdentifier, // Ensure userIdentifier is correctly populated
            file_name: fileName,
            content_type: bookFile.type
          })
        }
      );

      console.log('Presigned URL Response Status:', presignedUrlResponse.status);
      console.log('Presigned URL Response Headers:', Object.fromEntries([...presignedUrlResponse.headers.entries()]));
      
      if (!presignedUrlResponse.ok) {
        const responseText = await presignedUrlResponse.text();
        console.error('Failed presigned URL response text:', responseText);
        throw new Error(`Failed to get upload URL: ${presignedUrlResponse.status} ${presignedUrlResponse.statusText}`);
      }

      const data = await presignedUrlResponse.json();
      console.log('Upload URL Response Data:', data);
      
      if (!data.upload_url) {
        throw new Error('Invalid upload URL received');
      }

      // Upload file directly to S3 using the presigned URL
      console.log(`Uploading ${bookFile.type} to S3...`);
      console.log(`Upload file size: ${bookFile.size} bytes`);
      
      const uploadResponse = await fetch(data.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': bookFile.type
        },
        body: bookFile
      });

      console.log('S3 Upload Response Status:', uploadResponse.status);
      console.log('S3 Upload Response Headers:', Object.fromEntries([...uploadResponse.headers.entries()]));
      
      if (!uploadResponse.ok) {
        const responseText = await uploadResponse.text();
        console.error('Failed S3 upload response text:', responseText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      console.log('S3 Upload successful - Response:', await uploadResponse.text());

      console.log('Book uploaded successfully to S3');
      console.log('Book ID:', data.book_id);
      
      // Notify our API that the book was uploaded
      console.log('Notifying API about successful upload for processing...');
      
      const processPayload = { 
        fileUrl: `https://book-processing-uploads.s3.amazonaws.com/${data.s3_key}`,
        fileName: fileName,
        fileType: bookFile.type,
        bookId: data.book_id
      };
      console.log('Process book payload:', processPayload);
      
      const processResponse = await fetch('/api/books/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processPayload)
      });

      console.log('Process book response status:', processResponse.status);
      console.log('Process book response headers:', Object.fromEntries([...processResponse.headers.entries()]));
      
      if (!processResponse.ok) {
        const responseText = await processResponse.text();
        console.error('Failed process book response text:', responseText);
        throw new Error(`Failed to process book: ${processResponse.status} ${processResponse.statusText}`);
      }
      
      const processResult = await processResponse.json();
      console.log('Process book result:', processResult);

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
      
    } catch (err) {
      console.error('Book upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while uploading');
    } finally {
      setUploading(false);
    }
  };

  // Add a click handler to debug
  const handleButtonClick = () => {
    console.log('Upload button clicked');
    console.log('Current auth state:', { isAuthenticated, isLoading, user });
  };

  return (
    <div>
      <label
        htmlFor="book-upload"
        className={`inline-block px-4 py-2 cursor-pointer bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleButtonClick}
      >
        {uploading ? 'Uploading...' : buttonText}
      </label>
      <input
        id="book-upload"
        name="book-upload"
        type="file"
        accept={allowedExtensions.join(',')}
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-2">
          <div className="flex">
            <div className="flex-1 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-2 rounded-md bg-green-50 p-2">
          <div className="flex">
            <div className="flex-1 text-sm text-green-700">Book uploaded successfully! Redirecting to your library...</div>
          </div>
        </div>
      )}
    </div>
  );
}
