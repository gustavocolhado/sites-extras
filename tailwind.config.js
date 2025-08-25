/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      maxWidth: {
        'content': '1980px',
      },
      colors: {
        // Dark theme colors
        'dark-bg': '#0f0f0f',
        'dark-card': '#1a1a1a',
        'dark-hover': '#2a2a2a',
        
        // Light theme colors
        'light-bg': '#ffffff',
        'light-card': '#f8f9fa',
        'light-hover': '#e9ecef',
        
        // Common colors
        'accent-red': '#dc2626',
        'accent-red-hover': '#b91c1c',
        
        // Text colors
        'text-primary-dark': '#ffffff',
        'text-secondary-dark': '#a3a3a3',
        'text-primary-light': '#000000',
        'text-secondary-light': '#6b7280',
        
        // Domain-specific colors (will be overridden by CSS custom properties)
        'domain-primary': 'var(--primary-color, #e74c3c)',
        'domain-primary-hover': 'var(--primary-color-hover, #c0392b)',
      },
      fontFamily: {
        'sans': ['Roboto', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
} 