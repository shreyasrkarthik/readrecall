'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<any>(null);

    // Redirect if not authenticated
    if (status === 'unauthenticated') {
        router.push('/api/auth/signin');
        return null;
    }

    const handleImport = async () => {
        try {
            setImporting(true);
            const response = await fetch('/api/books/import', {
                method: 'POST',
            });
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Import failed:', error);
            setResults({ error: 'Import failed' });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Book Import</h2>
                
                <button
                    onClick={handleImport}
                    disabled={importing}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {importing ? 'Importing...' : 'Import Books'}
                </button>

                {results && (
                    <div className="mt-4">
                        <h3 className="font-semibold mb-2">Results:</h3>
                        <pre className="bg-gray-100 p-4 rounded">
                            {JSON.stringify(results, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 