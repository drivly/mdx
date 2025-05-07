import { join } from 'path'

/* global process, require */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    join(process.env.USER_PROJECT_DIR || process.cwd(), 'app/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.env.USER_PROJECT_DIR || process.cwd(), 'pages/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.env.USER_PROJECT_DIR || process.cwd(), 'components/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.env.USER_PROJECT_DIR || process.cwd(), 'content/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.env.USER_PROJECT_DIR || process.cwd(), 'src/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.env.USER_PROJECT_DIR || process.cwd(), 'mdx-components.js'),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
