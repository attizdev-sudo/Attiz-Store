'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6 px-4">
          <h2 style={{ fontFamily: 'serif', fontSize: '1.25rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>
            Something went wrong
          </h2>
          <p style={{ fontFamily: 'sans-serif', fontSize: '0.75rem', color: '#1a1a1a80', textAlign: 'center', maxWidth: '24rem', letterSpacing: '0.05em' }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ padding: '0.75rem 2rem', background: '#7c5c3e', color: 'white', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
