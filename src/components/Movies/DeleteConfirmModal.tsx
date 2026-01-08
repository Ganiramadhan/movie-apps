import { MdDelete } from 'react-icons/md';
import type { Movie } from '../../lib/api';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  movie: Movie | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  movie,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen || !movie) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="bg-[#1a1a1a] rounded-lg shadow-2xl max-w-md w-full border border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-900/30 rounded-full">
              <MdDelete className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete Movie</h2>
              <p className="text-gray-500 text-sm">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete <strong className="text-white">"{movie.title}"</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
