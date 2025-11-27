/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors optimized for big screens
        background: {
          DEFAULT: '#0f172a', // slate-900
          card: '#1e293b',    // slate-800
          hover: '#334155',   // slate-700
        },
        text: {
          primary: '#f1f5f9',   // slate-100
          secondary: '#94a3b8', // slate-400
          muted: '#64748b',     // slate-500
        },
        border: {
          DEFAULT: '#334155', // slate-700
          light: '#475569',   // slate-600
        },
        severity: {
          critical: '#ef4444',    // red-500
          high: '#ef4444',        // red-500
          medium: '#f59e0b',      // amber-500
          low: '#3b82f6',         // blue-500
          info: '#6b7280',        // gray-500
          healthy: '#10b981',     // emerald-500
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

// Made with Bob
