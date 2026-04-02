import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const routes = [
    {
        path: '/working-memory',
        title: 'Working Memory',
        id: 'working-memory-nav',
    },
    {
        path: '/boards',
        title: 'Boards',
        id: 'boards-nav',
    },
];

export default function AppLayout() {
  const location = useLocation();

  function isActive(path) {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="bg-zinc-900 border-b border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-zinc-100 px-2 tracking-tight">
                  Thing For Doing
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {routes.map((route) => (
                  <Link
                    key={route.id}
                    to={route.path}
                    className={
                      isActive(route.path)
                        ? 'border-violet-500 text-zinc-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                        : 'border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors'
                    }
                  >
                    {route.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
