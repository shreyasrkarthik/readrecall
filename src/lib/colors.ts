// ReadRecall Color Theme Utility
// Simple, subtle, and consistent design system

export type ColorTheme = {
  // Text colors
  primary: string;
  secondary: string;
  muted: string;
  
  // UI elements
  accent: string;
  border: string;
  background: string;
  card: string;
  
  // States
  hover: string;
  active: string;
};

// Main application theme - simple, clean, focusing on readability
export const appTheme: ColorTheme = {
  primary: 'text-gray-900',
  secondary: 'text-gray-700',
  muted: 'text-gray-500',
  accent: 'text-teal-600',
  border: 'border-gray-200',
  background: 'bg-white',
  card: 'bg-white',
  hover: 'hover:text-teal-700',
  active: 'active:text-teal-800',
};

// Book category themes - subtle variations that maintain consistency
const genreThemes: Record<string, {accent: string}> = {
  fiction: {
    accent: 'text-violet-600',
  },
  classics: {
    accent: 'text-amber-600',
  },
  adventure: {
    accent: 'text-emerald-600',
  },
  mystery: {
    accent: 'text-indigo-600',
  },
  romance: {
    accent: 'text-rose-600',
  },
  biography: {
    accent: 'text-blue-600',
  },
  scifi: {
    accent: 'text-cyan-600',
  },
  fantasy: {
    accent: 'text-purple-600',
  },
  historical: {
    accent: 'text-orange-600',
  },
  philosophy: {
    accent: 'text-slate-600',
  }
};

// Map book titles to specific genres for consistency
const bookGenreMap: Record<string, string> = {
  'Pride and Prejudice': 'romance',
  'Alice\'s Adventures in Wonderland': 'fantasy',
  'Frankenstein': 'fiction',
  'The Adventures of Sherlock Holmes': 'mystery',
  'The Adventures of Tom Sawyer': 'adventure',
  'Moby Dick': 'adventure',
  'The Yellow Wallpaper': 'fiction',
  'A Tale of Two Cities': 'classics',
  'The Prince': 'philosophy',
  'The Picture of Dorian Gray': 'fiction',
  'The Great Gatsby': 'classics',
  '1984': 'scifi',
  'To Kill a Mockingbird': 'fiction',
  'Brave New World': 'scifi',
  'The Catcher in the Rye': 'fiction',
  'The Hobbit': 'fantasy',
  'Wuthering Heights': 'romance',
  'Jane Eyre': 'romance',
  'Moby-Dick': 'adventure', // Alternative spelling
  'Alice in Wonderland': 'fantasy', // Alternative title
};

/**
 * Get book theme based on its title
 */
export function getBookTheme(title: string): ColorTheme {
  const { accent } = determineThemeFromTitle(title);
  
  return {
    ...appTheme,
    accent,
    hover: `hover:${accent.replace('text-', 'text-')}`,
    active: `active:${accent.replace('text-', 'text-')}`,
  };
}

/**
 * Determine a consistent theme based on the title
 */
function determineThemeFromTitle(title: string): {accent: string} {
  // Simple theme determination based on title length
  const length = title.length;
  
  if (length < 10) {
    return { accent: 'text-teal-600' };
  } else if (length < 20) {
    return { accent: 'text-blue-600' };
  } else {
    return { accent: 'text-indigo-600' };
  }
}

/**
 * Get the application's main theme
 */
export function getAppTheme(): ColorTheme {
  return appTheme;
}

/**
 * Common UI Component Styles
 */

/**
 * Get standard button style
 */
export function getButtonStyle(theme: ColorTheme, variant: 'primary' | 'secondary' = 'primary'): string {
  if (variant === 'primary') {
    return `${theme.accent} bg-white border ${theme.border} font-medium py-2 px-4 rounded-md shadow-sm ${theme.hover} transition-colors duration-200`;
  } else {
    return `${theme.muted} bg-gray-100 border ${theme.border} font-medium py-2 px-4 rounded-md ${theme.hover} transition-colors duration-200`;
  }
}

/**
 * Get card style
 */
export function getCardStyle(theme: ColorTheme): string {
  return `${theme.card} border ${theme.border} rounded-lg shadow-sm p-4`;
}

/**
 * Get navigation link style
 */
export function getNavLinkStyle(theme: ColorTheme, isActive: boolean = false): string {
  if (isActive) {
    return `${theme.accent} font-medium`;
  }
  return `${theme.secondary} ${theme.hover} transition-colors duration-200`;
}

/**
 * Get heading style
 */
export function getHeadingStyle(theme: ColorTheme, level: 1 | 2 | 3 = 1): string {
  const baseStyle = `${theme.primary} font-bold`;
  
  if (level === 1) return `${baseStyle} text-3xl md:text-4xl`;
  if (level === 2) return `${baseStyle} text-2xl md:text-3xl`;
  return `${baseStyle} text-xl md:text-2xl`;
}