export const metadata = {
  title: 'MDX Minimal Example',
  description: 'A minimal example of using the mdxe package',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
