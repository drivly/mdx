import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider, ThemeToggle } from './providers';

export const metadata: Metadata = {
  title: 'MDXE',
  description: 'Simple MDX file server with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <ThemeToggle />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
