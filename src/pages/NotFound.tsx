import { useNavigate } from 'react-router-dom';
import { MdError, MdHome } from 'react-icons/md';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-red-900/20 rounded-full">
            <MdError className="w-20 h-20 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
          >
            <MdHome className="w-5 h-5" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
