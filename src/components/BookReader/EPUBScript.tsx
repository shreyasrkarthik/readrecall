'use client';

import { useEffect } from 'react';

// This component is now a stub that just logs the presence of scripts
// Actual script loading is now handled directly in the EPUBReader component
export const EPUBScript = () => {
  useEffect(() => {
    console.log('📚 EPUBScript component mounted');
    console.log('📚 Note: Script loading is now managed directly in EPUBReader component');
    
    // This is now just here for information purposes
    const areScriptsLoaded = () => {
      const hasEpub = typeof window.ePub !== 'undefined';
      const hasJSZip = typeof window.JSZip !== 'undefined';
      
      console.log(`📚 EPUB.js available in window: ${hasEpub ? 'Yes ✅' : 'No ❌'}`);
      console.log(`📚 JSZip available in window: ${hasJSZip ? 'Yes ✅' : 'No ❌'}`);
      
      const epubScript = document.querySelector('script[src*="epub.min.js"]');
      const jszipScript = document.querySelector('script[src*="jszip.min.js"]');
      
      console.log('📚 Script tags in document:', {
        'JSZip': jszipScript ? 'Found ✅' : 'Not found ❌',
        'EPUB.js': epubScript ? 'Found ✅' : 'Not found ❌'
      });
    };
    
    // Check on mount
    areScriptsLoaded();
    
    // And check again after a short delay
    const timer = setTimeout(areScriptsLoaded, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return null;
};

// Add TypeScript declarations for global variables
declare global {
  interface Window {
    ePub: any;
    JSZip: any;
  }
} 