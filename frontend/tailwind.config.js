/** @type {import('tailwindcss').Config} */
// Design tokens for JobPortal.
// `blue` is remapped to the brand teal scale and `gray` to a cool slate-ink scale,
// so every existing page picks up the new identity without class-by-class edits.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#effaf8',
          100: '#d4f1ec',
          200: '#a9e2d9',
          300: '#74cdc1',
          400: '#43b0a4',
          500: '#25948a',
          600: '#157a73',
          700: '#12625d',
          800: '#124e4b',
          900: '#10413f',
          950: "#062625",
        },
        brand: {
          50: '#effaf8', 100: '#d4f1ec', 200: '#a9e2d9', 300: '#74cdc1', 400: '#43b0a4',
          500: '#25948a', 600: '#157a73', 700: '#12625d', 800: '#124e4b', 900: '#10413f',
        },
        accent: {
          50: '#fff8eb', 100: '#ffeccc', 200: '#ffd68f', 300: '#ffbb52',
          400: '#ffa01f', 500: '#f58200', 600: '#d96000', 700: '#b44504',
        },
        gray: {
          50: '#f6f8fa',
          100: '#edf1f4',
          200: '#dde4ea',
          300: '#c3cdd6',
          400: '#8f9eab',
          500: '#667685',
          600: '#4b5a68',
          700: '#374451',
          800: '#243040',
          900: '#142030',
        },
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.125rem' },
      boxShadow: {
        card: '0 1px 2px rgba(20,32,48,.04), 0 4px 16px -6px rgba(20,32,48,.08)',
        lift: '0 10px 30px -12px rgba(18,98,93,.35)',
      },
    },
  },
  plugins: [],
};
