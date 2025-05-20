import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="mb-4">The requested page could not be found.</p>
      <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
        Return Home
      </Link>
    </div>
  );
}
