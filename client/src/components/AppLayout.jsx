import { Link, Outlet } from 'react-router-dom';

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
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900 px-2">
                  Thing For Doing
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {routes.map((route) => (
                  <Link
                    key={route.id}
                    to={route.path}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
