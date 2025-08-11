/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./dist/**/*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional dark theme colors
        'primary': '#0ea5e9',      // Sky blue
        'secondary': '#06b6d4',    // Cyan
        'accent': '#14b8a6',       // Teal
        'neutral': '#1e293b',      // Slate
        'base-100': '#0f172a',     // Dark slate
        'base-200': '#1e293b',     // Lighter slate
        'base-300': '#334155',     // Even lighter slate
        'success': '#22c55e',      // Green
        'warning': '#f59e0b',      // Amber
        'error': '#ef4444',        // Red
        'info': '#3b82f6',         // Blue
        // CTA colors
        'cta-primary': '#ef4444',  // Red for primary CTAs
        'cta-hover': '#dc2626',    // Darker red for hover
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}