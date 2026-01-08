import { MdEdit, MdDelete, MdVisibility, MdStar, MdUnfoldMore, MdArrowUpward, MdArrowDownward, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { format } from 'date-fns';
import type { Movie } from '../../lib/api';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelpers';

type SortField = 'id' | 'title' | 'release_date' | 'vote_average' | 'popularity' | 'updated_at';
type SortOrder = 'ASC' | 'DESC';

interface MovieTableProps {
  movies: Movie[];
  isLoading: boolean;
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  sortBy: SortField;
  order: SortOrder;
  onSort: (field: SortField) => void;
  onPageChange: (page: number) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  onView: (movie: Movie) => void;
}

export function MovieTable({
  movies,
  isLoading,
  page,
  limit,
  totalPages,
  total,
  sortBy,
  order,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  onView,
}: MovieTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <MdUnfoldMore className="w-4 h-4 text-gray-600" />;
    return order === 'ASC' ? (
      <MdArrowUpward className="w-4 h-4 text-red-500" />
    ) : (
      <MdArrowDownward className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0d0d0d] border-b border-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Poster
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-2">
                  Title
                  <SortIcon field="title" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => onSort('release_date')}
              >
                <div className="flex items-center gap-2">
                  Release Date
                  <SortIcon field="release_date" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => onSort('vote_average')}
              >
                <div className="flex items-center gap-2">
                  Rating
                  <SortIcon field="vote_average" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => onSort('popularity')}
              >
                <div className="flex items-center gap-2">
                  Popularity
                  <SortIcon field="popularity" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => onSort('updated_at')}
              >
                <div className="flex items-center gap-2">
                  Updated
                  <SortIcon field="updated_at" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                    <p className="text-gray-400 text-sm">Loading movies...</p>
                  </div>
                </td>
              </tr>
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  No movies found
                </td>
              </tr>
            ) : (
              movies.map((movie, index) => (
                <tr key={movie.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400 font-medium">
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={getImageUrl(movie.poster_path, 'w92') ?? getPlaceholderImage(92, 138)}
                      alt={movie.title}
                      className="w-10 h-15 object-cover rounded cursor-pointer hover:ring-2 hover:ring-red-500 transition-all bg-gray-800"
                      onClick={() => onView(movie)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getPlaceholderImage(92, 138);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p 
                        className="font-medium text-white truncate text-sm cursor-pointer hover:text-red-500 transition-colors" 
                        title={movie.title}
                        onClick={() => onView(movie)}
                      >
                        {movie.title}
                      </p>
                      {movie.language && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {movie.language.name}
                        </p>
                      )}
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movie.genres.slice(0, 2).map((genre) => (
                            <span key={genre.id} className="text-xs text-gray-600">
                              {genre.name}
                            </span>
                          ))}
                          {movie.genres.length > 2 && (
                            <span className="text-xs text-gray-600">+{movie.genres.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{movie.release_date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <MdStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-white font-medium">
                        {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {movie.popularity?.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {movie.updated_at
                      ? format(new Date(movie.updated_at), 'dd/MM/yyyy HH:mm')
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(movie)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-900/30 rounded-md transition-colors"
                        title="View Details"
                      >
                        <MdVisibility className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(movie)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                        title="Edit"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(movie)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/30 rounded-md transition-colors"
                        title="Delete"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="px-4 py-3 border-t border-gray-800 bg-[#0d0d0d] flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of{' '}
            {total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="p-2 border border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 transition-colors"
              title="First Page"
            >
              <span className="text-xs font-medium">First</span>
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 transition-colors"
              title="Previous Page"
            >
              <MdChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-400 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 transition-colors"
              title="Next Page"
            >
              <MdChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="p-2 border border-gray-700 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 transition-colors"
              title="Last Page"
            >
              <span className="text-xs font-medium">Last</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
