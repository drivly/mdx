import React from 'react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl mt-3">Page Not Found</h2>
        <p className="mt-3 text-lg">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Go back home
          </a>
        </div>
      </main>
    </div>
  )
}
