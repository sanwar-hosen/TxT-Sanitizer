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
        // Brand primary
        'primary':                    'var(--brand)',
        'primary-hover':              'var(--brand-hover)',
        'primary-fixed':              '#dbe1ff',
        'primary-fixed-dim':          '#b4c5ff',
        'primary-container':          '#2563eb',
        'on-primary':                 'var(--surface)',
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
        'background':                 'var(--surface-dim)',
        'surface':                    'var(--surface)',
        'surface-dim':                'var(--surface-dim)',
        'surface-bright':             'var(--surface)',
        'surface-variant':            'var(--surface-2)',
        'surface-tint':               'var(--brand)',
        'surface-container-lowest':   'var(--surface)',
        'surface-container-low':      'var(--surface-dim)',
        'surface-container':          'var(--surface-2)',
        'surface-container-high':     'var(--surface-2)',
        'surface-container-highest':  'var(--surface-dim)',
        'inverse-surface':            '#213145',
        'inverse-on-surface':         '#eaf1ff',

        // On-surface
        'on-background':              'var(--text)',
        'on-surface':                 'var(--text)',
        'on-surface-variant':         'var(--text-muted)',

        // Outline
        'outline':                    'var(--border)',
        'outline-variant':            'var(--border)',

        // Error
        'error':                      'var(--error)',
        'error-hover':                'var(--error-hover)',
        'error-container':            'var(--error-container)',
        'on-error':                   'var(--on-error)',
        'on-error-container':         'var(--on-error-container)',

        // Legacy compat keys
        'textMain':    'var(--text)',
        'textMuted':   'var(--text-muted)',
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
