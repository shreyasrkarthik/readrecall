'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import the FeatureSlider component with dynamic loading
const FeatureSlider = dynamic(() => import('@/components/Home/FeatureSlider'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto mt-16 h-64 bg-black animate-pulse rounded-xl"></div>
  ),
});

export default function FeatureSliderWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full max-w-4xl mx-auto mt-16 h-64 bg-black animate-pulse rounded-xl"></div>;
  }

  return <FeatureSlider />;
} 