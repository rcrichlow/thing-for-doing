import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-8 py-16 text-center shadow-lg">
      <h1 className="mb-4 text-4xl font-bold text-zinc-100">404</h1>
      <p className="mb-8 text-xl text-zinc-400">Page not found</p>
      <Link to="/" className="font-medium text-violet-400 underline decoration-violet-500/40 underline-offset-4 transition-colors hover:text-violet-300">
        Go back home
      </Link>
    </div>
  )
}
