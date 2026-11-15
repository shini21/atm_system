/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        screen: "var(--screen)",
        gold: "var(--gold)",
        platinum: "var(--platinum)",
        "on-accent": "var(--on-accent)",
        chassis: {
          DEFAULT: "var(--chassis-bg)",
          bezel: "var(--chassis-bezel)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          subdued: "var(--surface-subdued)",
          hover: "var(--surface-hover)",
          elevated: "var(--surface-elevated)",
        },
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        navy: {
          DEFAULT: 'var(--navy)',
          deep: 'var(--navy-deep)',
        },
        // New Apex Blue tokens
        'apex-blue': 'var(--apex-blue)',
        'atlantic': 'var(--atlantic)',
        'midnight': 'var(--midnight)',
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          brass: "var(--accent-brass)",
        },
        cyan: {
          DEFAULT: "var(--cyan)",
          subtle: "var(--cyan-subtle)",
        },
        champagne: {
          DEFAULT: "var(--champagne)",
          subtle: "var(--champagne-subtle)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          subtle: "var(--danger-subtle)",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Instrument Sans"', '"Helvetica Neue"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Georgia', '"Times New Roman"', 'serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'card': '10px',
        'control': '8px',
        'dialog': '14px',
      },
      boxShadow: {
        'luxury': 'var(--card-shadow)',
        'pocket': 'var(--screen-pocket)',
        'elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'cyan-glow': '0 0 16px -2px rgba(54, 188, 232, 0.45)',
        'apex-glow': '0 0 20px -4px rgba(0,111,207,0.35)',
        'blue-glow': '0 0 16px -2px rgba(0,111,207,0.40)',
      }
    },
  },
  plugins: [],
}
