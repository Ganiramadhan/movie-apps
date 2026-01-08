import { MdClose, MdStar, MdCalendarToday, MdLanguage, MdThumbUp } from 'react-icons/md';
import type { Movie } from '../lib/api';
import { format } from 'date-fns';
import { getImageUrl, getPlaceholderImage } from '../utils/imageHelpers';

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
}

export default function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const posterUrl = getImageUrl(movie.poster_path, 'w500') ?? getPlaceholderImage(500, 750);
  const backdropUrl = getImageUrl(movie.backdrop_path, 'original') ?? getPlaceholderImage(1280, 720);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
      <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-[#1a1a1a] rounded-lg">
        {/* Close Button */}
        <button
        aria-label="Close Modal"
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <MdClose className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Backdrop Image */}
        {movie.backdrop_path && (
          <div className="relative h-48 sm:h-64 md:h-96 overflow-hidden rounded-t-lg">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover bg-gray-800"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"%3E%3Crect fill="%232a2a2a" width="1280" height="720"/%3E%3Ctext fill="%23666" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Backdrop%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Poster */}
            <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 mx-auto md:mx-0">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg bg-gray-800"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect fill="%232a2a2a" width="500" height="750"/%3E%3Ctext fill="%23666" font-family="Arial" font-size="20" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Poster%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h2>
              {movie.original_title !== movie.title && (
                <p className="text-gray-400 mb-3 sm:mb-4 italic text-sm sm:text-base">{movie.original_title}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <MdStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  <span className="text-white font-semibold">{movie.vote_average?.toFixed(1)}</span>
                  <span className="text-gray-400">/ 10</span>
                </div>

                <div className="flex items-center gap-2">
                  <MdThumbUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <span className="text-gray-400">{movie.vote_count?.toLocaleString()} votes</span>
                </div>

                {movie.release_date && (
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-gray-400">{format(new Date(movie.release_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}

                {movie.language && (
                  <div className="flex items-center gap-2">
                    <MdLanguage className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <span className="text-gray-400">{movie.language.name}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 sm:px-3 bg-gray-800 text-gray-300 text-xs sm:text-sm rounded-full border border-gray-700"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Popularity & Adult Badge */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="px-2 py-1 sm:px-3 bg-red-600 text-white text-xs sm:text-sm rounded-full">
                  Popularity: {movie.popularity?.toFixed(0)}
                </span>
                {movie.adult && (
                  <span className="px-2 py-1 sm:px-3 bg-red-800 text-white text-xs sm:text-sm rounded-full">18+</span>
                )}
              </div>

              {/* Overview */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{movie.overview || 'No overview available.'}</p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-400">TMDB ID:</span>
                  <span className="text-white ml-2">{movie.tmdb_id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
