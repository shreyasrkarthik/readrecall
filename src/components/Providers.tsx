'use client';

import { AuthProvider } from '@/lib/context/AuthContext';
import MainLayout from './Layout/MainLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <MainLayout>
                {children}
            </MainLayout>
        </AuthProvider>
    );
} 