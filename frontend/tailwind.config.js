/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Unreal Engine Dark Theme
        'ue-bg': {
          dark: '#0A0E27',
          card: '#13182E',
          hover: '#1A2038',
          overlay: 'rgba(10, 14, 39, 0.95)',
        },
        'ue-primary': {
          DEFAULT: '#00D9FF',
          glow: 'rgba(0, 217, 255, 0.5)',
          dark: '#00A3CC',
        },
        'ue-secondary': {
          DEFAULT: '#7B2CBF',
          light: '#9D4EDD',
          dark: '#5A189A',
        },
        'ue-accent': {
          DEFAULT: '#FF006E',
          light: '#FF4D9D',
          dark: '#C7004F',
        },
        'ue-success': '#06FFA5',
        'ue-warning': '#FFB800',
        'ue-error': '#FF0844',
        'ue-text': {
          primary: '#E8F1FF',
          secondary: '#8B9DC3',
          muted: '#4A5568',
        },
        'ue-border': '#2D3748',

        // Character Classes
        'class-warrior': '#FF6B35',
        'class-assassin': '#9D4EDD',
        'class-mage': '#00D9FF',
        'class-tank': '#06FFA5',
        'class-trickster': '#FFB800',

        // Equipment Rarity
        'rarity-common': '#9CA3AF',
        'rarity-rare': '#3B82F6',
        'rarity-epic': '#A855F7',
        'rarity-legendary': '#F59E0B',
      },
      fontFamily: {
        'display': ['Rajdhani', 'Orbitron', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cyber': 'linear-gradient(135deg, #0A0E27 0%, #1A2038 50%, #13182E 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(0, 217, 255, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 217, 255, 0.5)',
        'neon-lg': '0 0 30px rgba(0, 217, 255, 0.7)',
        'glow': '0 0 15px rgba(123, 44, 191, 0.5)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 217, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 1), 0 0 30px rgba(0, 217, 255, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
