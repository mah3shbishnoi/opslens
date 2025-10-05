/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        editorial: {
          canvas: '#FAFAF9',
          surface: '#FFFFFF',
          subtle: '#F5F5F4',
          border: '#E7E5E4',
          borderStrong: '#D6D3D1',
          ink: '#1C1917',
          charcoal: '#292524',
          muted: '#78716C',
          faint: '#A8A29E',
        },
        darkSurface: {
          canvas: '#0F0F11',
          surface: '#18181B',
          subtle: '#27272A',
          border: '#27272A',
          text: '#F4F4F5',
          muted: '#A1A1AA',
        },
        brand: {
          blue: '#2563EB',
          emerald: '#059669',
          purple: '#7C3AED',
          amber: '#D97706',
          rose: '#E11D48',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'float': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
