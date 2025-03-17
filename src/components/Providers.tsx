'use client';

import { SessionProvider } from 'next-auth/react';
import MainLayout from './Layout/MainLayout';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <MainLayout>
                {children}
            </MainLayout>
        </SessionProvider>
    );
} 