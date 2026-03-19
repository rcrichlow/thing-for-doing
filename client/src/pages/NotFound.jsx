import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
        Go back home
      </Link>
    </div>
  )
}
