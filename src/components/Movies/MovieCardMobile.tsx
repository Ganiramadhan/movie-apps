import { MdEdit, MdDelete, MdStar } from 'react-icons/md';
import type { Movie } from '../../lib/api';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelpers';

interface MovieCardMobileProps {
  movie: Movie;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function MovieCardMobile({ movie, onEdit, onDelete, onView }: MovieCardMobileProps) {
  const posterUrl = getImageUrl(movie.poster_path, 'w200') ?? getPlaceholderImage(200, 300);

  return (
    <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
      <div className="flex">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-24 h-36 object-cover shrink-0 cursor-pointer bg-gray-800"
          onClick={onView}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getPlaceholderImage(200, 300);
          }}
        />
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm line-clamp-2 cursor-pointer hover:text-red-500" onClick={onView}>
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-yellow-500 text-xs">
                <MdStar className="w-3 h-3" />
                {movie.vote_average?.toFixed(1)}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-400 text-xs">{movie.release_date?.split('-')[0]}</span>
            </div>
            {movie.language && (
              <p className="text-gray-400 text-xs mt-1">{movie.language.name}</p>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {movie.genres.slice(0, 2).map((genre) => (
                  <span key={genre.id} className="text-gray-500 text-xs">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors"
              title="Edit Movie"
            >
              <MdEdit className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 rounded text-xs transition-colors"
              title="Delete Movie"
            >
              <MdDelete className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
