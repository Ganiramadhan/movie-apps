import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi, type Movie } from '../lib/api';
import { MdAdd, MdRefresh, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import toast from 'react-hot-toast';
import MovieDetailModal from '../components/MovieDetailModal';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { FilterSection } from '../components/Movies/FilterSection';
import { MovieTable } from '../components/Movies/MovieTable';
import { MovieCardMobile } from '../components/Movies/MovieCardMobile';
import { MovieModal } from '../components/Movies/MovieModal';
import { DeleteConfirmModal } from '../components/Movies/DeleteConfirmModal';

// Common movie languages
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'th', label: 'Thai' },
  { value: 'tr', label: 'Turkish' },
];

type SortField = 'id' | 'title' | 'release_date' | 'vote_average' | 'popularity' | 'updated_at';
type SortOrder = 'ASC' | 'DESC';

interface MovieFormData {
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  tmdb_id: number;
}

const initialFormData: MovieFormData = {
  title: '',
  original_title: '',
  overview: '',
  release_date: '',
  poster_path: '',
  backdrop_path: '',
  vote_average: 0,
  vote_count: 0,
  popularity: 0,
  adult: false,
  original_language: 'en',
  tmdb_id: Math.floor(Math.random() * 1000000),
};

export function Movies() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('updated_at');
  const [order, setOrder] = useState<SortOrder>('DESC');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingMovie, setDeletingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState<MovieFormData>(initialFormData);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // States
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce search
  const handleSearch = (value: string) => {
    setSearch(value);
    setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
  };

  // Query
  const { data: response, isLoading } = useQuery({
    queryKey: ['movies', page, limit, debouncedSearch, sortBy, order, startDate, endDate],
    queryFn: () =>
      movieApi.getAll({
        page,
        limit,
        search: debouncedSearch,
        sort_by: sortBy,
        order,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Movie>) => movieApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Movie created successfully!');
      closeModal();
    },
    onError: () => {
      toast.error('Failed to create movie');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Movie> }) => movieApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Movie updated successfully!');
      closeModal();
    },
    onError: () => {
      toast.error('Failed to update movie');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => movieApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Movie deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingMovie(null);
    },
    onError: () => {
      toast.error('Failed to delete movie');
    },
  });

  const movies = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta?.total_pages || 1;

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('DESC');
    }
  };

  const openCreateModal = () => {
    setEditingMovie(null);
    setFormData({
      ...initialFormData,
      tmdb_id: Math.floor(Math.random() * 1000000),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      adult: movie.adult,
      original_language: movie.language?.code || 'en',
      tmdb_id: movie.tmdb_id,
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (movie: Movie) => {
    setDeletingMovie(movie);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent, overrideData?: Partial<MovieFormData>) => {
    e.preventDefault();

    const dataToSubmit = { ...formData, ...overrideData };

    if (editingMovie) {
      updateMutation.mutate({ id: editingMovie.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleDelete = () => {
    if (deletingMovie) {
      deleteMutation.mutate(deletingMovie.id);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcut('n', openCreateModal, true);
  useKeyboardShortcut('r', async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['movies'] });
    setTimeout(() => setIsRefreshing(false), 800);
  }, true);
  
  useKeyboardShortcut('Escape', () => {
    if (isModalOpen) closeModal();
    if (isDeleteModalOpen) {
      setIsDeleteModalOpen(false);
      setDeletingMovie(null);
    }
    if (selectedMovie) setSelectedMovie(null);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-white">Movie Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await queryClient.invalidateQueries({ queryKey: ['movies'] });
              setTimeout(() => setIsRefreshing(false), 800);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            title="Refresh table (Ctrl+R)"
          >
            <MdRefresh className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors font-medium text-sm"
            title="Add new movie (Ctrl+N)"
          >
            <MdAdd className="w-5 h-5" />
            Add Movie
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterSection
        search={search}
        onSearchChange={handleSearch}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(value) => {
          setStartDate(value);
          setPage(1);
        }}
        onEndDateChange={(value) => {
          setEndDate(value);
          setPage(1);
        }}
        onClearSearch={() => {
          setSearch('');
          setDebouncedSearch('');
          setPage(1);
        }}
        onClearDateFilter={() => {
          setStartDate('');
          setEndDate('');
          setPage(1);
        }}
      />

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <MovieTable
          movies={movies}
          isLoading={isLoading}
          page={page}
          limit={limit}
          totalPages={totalPages}
          total={meta?.total || 0}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          onPageChange={setPage}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onView={setSelectedMovie}
        />
      </div>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No movies found</div>
        ) : (
          movies.map((movie) => (
            <MovieCardMobile
              key={movie.id}
              movie={movie}
              onEdit={() => openEditModal(movie)}
              onDelete={() => openDeleteModal(movie)}
              onView={() => setSelectedMovie(movie)}
            />
          ))
        )}

        {/* Mobile Pagination */}
        {meta && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-400">
              {(page - 1) * limit + 1}-{Math.min(page * limit, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 bg-[#1a1a1a] border border-gray-700 rounded-md disabled:opacity-50 text-gray-400"
                title="First Page"
              >
                <span className="text-xs">First</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-[#1a1a1a] border border-gray-700 rounded-md disabled:opacity-50 text-gray-400"
                title="Previous Page"
              >
                <MdChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400">{page}/{totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-[#1a1a1a] border border-gray-700 rounded-md disabled:opacity-50 text-gray-400"
                title="Next Page"
              >
                <MdChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="p-2 bg-[#1a1a1a] border border-gray-700 rounded-md disabled:opacity-50 text-gray-400"
                title="Last Page"
              >
                <span className="text-xs">Last</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <MovieModal
        isOpen={isModalOpen}
        editingMovie={editingMovie}
        formData={formData}
        onFormDataChange={setFormData}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        languageOptions={LANGUAGE_OPTIONS}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        movie={deletingMovie}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingMovie(null);
        }}
        isDeleting={deleteMutation.isPending}
      />

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
