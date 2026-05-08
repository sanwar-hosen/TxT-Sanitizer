/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand primary (mapped from your HTML's #004ac6)
        'primary':                    '#004AAD',
        'primary-hover':              '#003d91',
        'primary-fixed':              '#dbe1ff',
        'primary-fixed-dim':          '#b4c5ff',
        'primary-container':          '#2563eb',
        'on-primary':                 '#ffffff',
        'on-primary-fixed':           '#00174b',
        'on-primary-fixed-variant':   '#003ea8',
        'on-primary-container':       '#eeefff',
        'inverse-primary':            '#b4c5ff',

        // Secondary
        'secondary':                  '#006c49',
        'secondary-container':        '#6cf8bb',
        'secondary-fixed':            '#6ffbbe',
        'secondary-fixed-dim':        '#4edea3',
        'on-secondary':               '#ffffff',
        'on-secondary-container':     '#00714d',
        'on-secondary-fixed':         '#002113',
        'on-secondary-fixed-variant': '#005236',

        // Tertiary
        'tertiary':                   '#943700',
        'tertiary-container':         '#bc4800',
        'tertiary-fixed':             '#ffdbcd',
        'tertiary-fixed-dim':         '#ffb596',
        'on-tertiary':                '#ffffff',
        'on-tertiary-container':      '#ffede6',
        'on-tertiary-fixed':          '#360f00',
        'on-tertiary-fixed-variant':  '#7d2d00',

        // Surface / Background
        'background':                 '#f8f9ff',
        'surface':                    '#f8f9ff',
        'surface-dim':                '#cbdbf5',
        'surface-bright':             '#f8f9ff',
        'surface-variant':            '#d3e4fe',
        'surface-tint':               '#0053db',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#eff4ff',
        'surface-container':          '#e5eeff',
        'surface-container-high':     '#dce9ff',
        'surface-container-highest':  '#d3e4fe',
        'inverse-surface':            '#213145',
        'inverse-on-surface':         '#eaf1ff',

        // On-surface
        'on-background':              '#0b1c30',
        'on-surface':                 '#0b1c30',
        'on-surface-variant':         '#434655',

        // Outline
        'outline':                    '#737686',
        'outline-variant':            '#c3c6d7',

        // Error
        'error':                      '#ba1a1a',
        'error-container':            '#ffdad6',
        'on-error':                   '#ffffff',
        'on-error-container':         '#93000a',

        // Legacy compat keys
        'textMain':    '#1e293b',
        'textMuted':   '#64748b',
      },
      fontFamily: {
        sans:  ['Rubik', 'Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'md': '0.25rem',
        'lg': '0.5rem',
      },
    },
  },
  plugins: [],
}
