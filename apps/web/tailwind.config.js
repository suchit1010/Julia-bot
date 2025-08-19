/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Julia-inspired color palette
        julia: {
          primary: '#9558b2',    // Julia purple
          secondary: '#389826',   // Julia green
          accent: '#cb3c33',     // Julia red
          neural: '#4c72b0',     // Neural blue
          swarm: '#dd8452',      // Swarm orange
          dark: '#1a1a1a',       // Dark background
        },
        ai: {
          neural: '#9333ea',
          swarm: '#06b6d4',
          consensus: '#10b981',
          trading: '#f59e0b',
          purple: '#a855f7',
          blue: '#3b82f6',
          green: '#22c55e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neural-pulse': 'neuralPulse 3s ease-in-out infinite',
        'swarm-dance': 'swarmDance 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)' },
        },
        neuralPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(147, 51, 234, 0.9)',
            transform: 'scale(1.05)'
          },
        },
        swarmDance: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(2deg)' },
          '50%': { transform: 'translateY(0px) rotate(0deg)' },
          '75%': { transform: 'translateY(-5px) rotate(-2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'ai': '0 0 20px rgba(147, 51, 234, 0.3)',
        'swarm': '0 0 20px rgba(6, 182, 212, 0.3)',
        'consensus': '0 0 20px rgba(16, 185, 129, 0.3)',
        'neural': '0 0 30px rgba(147, 51, 234, 0.4)',
        'trading': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-purple': '0 0 50px rgba(147, 51, 234, 0.5)',
        'glow-blue': '0 0 50px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 50px rgba(34, 197, 94, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'julia-gradient': 'linear-gradient(135deg, #9558b2 0%, #389826 50%, #cb3c33 100%)',
        'neural-gradient': 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
        'swarm-gradient': 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slate-900': '#0a1020',
        'slate-800': '#1e2a44',
        'slate-700': '#334155',
        'gray-400': '#9ca3af',
        'gray-200': '#e5e7eb',
        'green-400': '#34d399',
        'green-500': '#10b981',
        'purple-400': '#c084fc',
        'purple-600': '#7c3aed',
        'purple-700': '#6d28d9',
        'blue-400': '#60a5fa',
        'blue-500': '#3b82f6',
        'orange-400': '#fb923c',
        'red-400': '#f87171',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};