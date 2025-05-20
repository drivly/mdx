import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  distDir: process.env.USER_CWD ? `${process.env.USER_CWD}/.next` : '.next',
};

export default withMDX(nextConfig);
