// ReadRecall Color Theme Utility
// Simple, subtle, and consistent design system with light/dark mode support

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
  
  // Dark mode variants
  darkPrimary: string;
  darkSecondary: string;
  darkMuted: string;
  darkAccent: string;
  darkBorder: string;
  darkBackground: string;
  darkCard: string;
  darkHover: string;
  darkActive: string;
};

// Main application theme - simple, clean, focusing on readability
export const appTheme: ColorTheme = {
  // Light mode
  primary: 'text-gray-900',
  secondary: 'text-gray-700',
  muted: 'text-gray-500',
  accent: 'text-teal-600',
  border: 'border-gray-200',
  background: 'bg-gray-50',
  card: 'bg-white',
  hover: 'hover:text-teal-700',
  active: 'active:text-teal-800',
  
  // Dark mode
  darkPrimary: 'dark:text-gray-100',
  darkSecondary: 'dark:text-gray-300',
  darkMuted: 'dark:text-gray-400',
  darkAccent: 'dark:text-teal-400',
  darkBorder: 'dark:border-gray-700',
  darkBackground: 'dark:bg-gray-900',
  darkCard: 'dark:bg-gray-800',
  darkHover: 'dark:hover:text-teal-300',
  darkActive: 'dark:active:text-teal-200',
};

// Book category themes - subtle variations that maintain consistency
const genreThemes: Record<string, {accent: string, darkAccent: string}> = {
  fiction: {
    accent: 'text-violet-600',
    darkAccent: 'dark:text-violet-400',
  },
  classics: {
    accent: 'text-amber-600',
    darkAccent: 'dark:text-amber-400',
  },
  adventure: {
    accent: 'text-emerald-600',
    darkAccent: 'dark:text-emerald-400',
  },
  mystery: {
    accent: 'text-indigo-600',
    darkAccent: 'dark:text-indigo-400',
  },
  romance: {
    accent: 'text-rose-600',
    darkAccent: 'dark:text-rose-400',
  },
  biography: {
    accent: 'text-blue-600',
    darkAccent: 'dark:text-blue-400',
  },
  scifi: {
    accent: 'text-cyan-600',
    darkAccent: 'dark:text-cyan-400',
  },
  fantasy: {
    accent: 'text-purple-600',
    darkAccent: 'dark:text-purple-400',
  },
  historical: {
    accent: 'text-orange-600',
    darkAccent: 'dark:text-orange-400',
  },
  philosophy: {
    accent: 'text-slate-600',
    darkAccent: 'dark:text-slate-400',
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
  // Check if we have a predefined genre for this book
  const genre = bookGenreMap[title];
  const themeAccent = genre && genreThemes[genre] 
    ? genreThemes[genre]
    : determineThemeFromTitle(title);
  
  // Return a merged theme with the base app theme and specific accent color
  return {
    ...appTheme,
    accent: themeAccent.accent,
    hover: themeAccent.accent.replace('text-', 'hover:text-'),
    active: themeAccent.accent.replace('text-', 'active:text-').replace('600', '800'),
    darkAccent: themeAccent.darkAccent,
    darkHover: themeAccent.darkAccent.replace('dark:text-', 'dark:hover:text-'),
    darkActive: themeAccent.darkAccent.replace('dark:text-', 'dark:active:text-').replace('400', '200'),
  };
}

/**
 * Determine a consistent theme based on the title
 */
function determineThemeFromTitle(title: string): {accent: string, darkAccent: string} {
  const genreKeys = Object.keys(genreThemes);
  const sum = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const themeIndex = sum % genreKeys.length;
  const genre = genreKeys[themeIndex];
  return genreThemes[genre];
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
    return `${theme.accent} ${theme.darkAccent} bg-white dark:bg-gray-800 border ${theme.border} ${theme.darkBorder} font-medium py-2 px-4 rounded-md shadow-sm ${theme.hover} ${theme.darkHover} transition-colors duration-200`;
  } else {
    return `${theme.muted} ${theme.darkMuted} bg-gray-100 dark:bg-gray-700 border ${theme.border} ${theme.darkBorder} font-medium py-2 px-4 rounded-md ${theme.hover} ${theme.darkHover} transition-colors duration-200`;
  }
}

/**
 * Get card style
 */
export function getCardStyle(theme: ColorTheme): string {
  return `${theme.card} ${theme.darkCard} border ${theme.border} ${theme.darkBorder} rounded-lg shadow-sm p-4`;
}

/**
 * Get navigation link style
 */
export function getNavLinkStyle(theme: ColorTheme, isActive: boolean = false): string {
  if (isActive) {
    return `${theme.accent} ${theme.darkAccent} font-medium`;
  }
  return `${theme.secondary} ${theme.darkSecondary} ${theme.hover} ${theme.darkHover} transition-colors duration-200`;
}

/**
 * Get heading style
 */
export function getHeadingStyle(theme: ColorTheme, level: 1 | 2 | 3 = 1): string {
  const baseStyle = `${theme.primary} ${theme.darkPrimary} font-bold`;
  
  if (level === 1) return `${baseStyle} text-3xl md:text-4xl`;
  if (level === 2) return `${baseStyle} text-2xl md:text-3xl`;
  return `${baseStyle} text-xl md:text-2xl`;
}