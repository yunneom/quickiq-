import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <p className="text-6xl">🔍</p>
      <h1 className="mt-6 text-2xl font-bold">404</h1>
      <p className="mt-2 text-gray-600">Page not found.</p>
      <Link href="/" className="mt-6 inline-block text-brand-600 underline">
        Home
      </Link>
    </div>
  );
}
