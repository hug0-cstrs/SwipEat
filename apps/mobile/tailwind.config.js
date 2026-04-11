/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Surface scale ─────────────────────────────────────────────
        surface: {
          DEFAULT: '#f6f6f5',
          bright: '#f6f6f5',
          dim: '#d3d5d4',
          container: {
            DEFAULT: '#e7e8e7',
            lowest: '#ffffff',
            low: '#f0f1f0',
            high: '#e1e3e2',
            highest: '#dbdddc',
          },
        },
        // ── Primary ───────────────────────────────────────────────────
        primary: {
          DEFAULT: '#a63300',
          dim: '#922c00',
          container: '#ff7949',
          fixed: '#ff7949',
          'fixed-dim': '#f7652f',
        },
        'on-primary': {
          DEFAULT: '#ffefeb',
          container: '#451000',
        },
        // ── Secondary ─────────────────────────────────────────────────
        secondary: {
          DEFAULT: '#a73200',
          dim: '#932b00',
          container: '#ffc4b2',
        },
        'on-secondary': {
          DEFAULT: '#ffefeb',
          container: '#852600',
        },
        // ── Tertiary (golden) ─────────────────────────────────────────
        tertiary: {
          DEFAULT: '#815100',
          dim: '#714600',
          container: '#f8a010',
        },
        'on-tertiary': {
          DEFAULT: '#fff0e3',
          container: '#4a2c00',
        },
        // ── On-surface ────────────────────────────────────────────────
        'on-surface': {
          DEFAULT: '#2d2f2f',
          variant: '#5a5c5b',
        },
        // ── Outline ───────────────────────────────────────────────────
        outline: {
          DEFAULT: '#767776',
          variant: '#acadac',
        },
        // ── Error ─────────────────────────────────────────────────────
        error: {
          DEFAULT: '#b31b25',
          container: '#fb5151',
        },
        'on-error': {
          DEFAULT: '#ffefee',
          container: '#570008',
        },
        // ── Inverse ───────────────────────────────────────────────────
        'inverse-surface': '#0c0f0e',
        'inverse-primary': '#fe6a34',
        'inverse-on-surface': '#9c9d9c',
        // ── Background ────────────────────────────────────────────────
        background: '#f6f6f5',
        'on-background': '#2d2f2f',
        // ── Swipe indicators ──────────────────────────────────────────
        like: '#22C55E',
        pass: '#EF4444',
        superlike: '#F59E0B',
        // ── Brand legacy (backward compat) ────────────────────────────
        brand: {
          50: '#fff5f0',
          100: '#ffe8dc',
          500: '#ff6b35',
          600: '#e55a28',
          900: '#7c1d0a',
        },
      },
      fontFamily: {
        jakarta: ['PlusJakartaSans_400Regular', 'sans-serif'],
        'jakarta-medium': ['PlusJakartaSans_500Medium', 'sans-serif'],
        'jakarta-semibold': ['PlusJakartaSans_600SemiBold', 'sans-serif'],
        'jakarta-bold': ['PlusJakartaSans_700Bold', 'sans-serif'],
        'jakarta-extrabold': ['PlusJakartaSans_800ExtraBold', 'sans-serif'],
      },
      spacing: {
        // h-13 = 52px (input height from design system)
        13: '3.25rem',
      },
    },
  },
  plugins: [],
};
