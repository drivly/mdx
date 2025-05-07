import { join } from 'path'

/* global process, require */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    join(process.cwd(), 'app/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.cwd(), 'pages/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.cwd(), 'components/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.cwd(), 'content/**/*.{js,ts,jsx,tsx,md,mdx}'),
    join(process.cwd(), 'src/**/*.{js,ts,jsx,tsx,md,mdx}'),
    process.env.MDX_COMPONENTS_PATH || join(process.cwd(), 'mdx-components.js'),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
