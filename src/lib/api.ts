import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.movie.ganipedia.xyz/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Genre {
  id: number;
  tmdb_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Movie {
  id: number;
  tmdb_id: number;
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
  language_id?: number;
  language?: Language;
  genres?: Genre[];
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: number;
  sync_type: string;
  status: string;
  movies_added: number;
  movies_updated: number;
  error_message?: string;
  synced_at: string;
  created_at: string;
}

export interface DashboardStats {
  total_movies: number;
  average_rating: number;
  total_votes: number;
  last_sync_time: string | null;
  top_rated_movies: Movie[];
  most_popular: Movie[];
  recently_added: Movie[];
}

export interface PieChartData {
  label: string;
  value: number;
  code: string;
}

export interface ColumnChartData {
  label: string;
  value: number;
}

export interface ChartData {
  pie_chart: PieChartData[];
  column_chart: ColumnChartData[];
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// Movie API
export const movieApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    order?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get<ApiResponse<Movie[]>>('/movies', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
    return response.data;
  },

  create: async (movie: Partial<Movie>) => {
    const response = await api.post<ApiResponse<Movie>>('/movies', movie);
    return response.data;
  },

  update: async (id: number, movie: Partial<Movie>) => {
    const response = await api.put<ApiResponse<Movie>>(`/movies/${id}`, movie);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/movies/${id}`);
    return response.data;
  },
};

// Sync API
export const syncApi = {
  syncMovies: async (pages: number = 1) => {
    const response = await api.post<ApiResponse<SyncLog>>('/sync/movies', null, {
      params: { pages },
    });
    return response.data;
  },

  getLastSyncLog: async () => {
    const response = await api.get<ApiResponse<SyncLog | null>>('/sync/last-log');
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },
};

// Chart API
export const chartApi = {
  getChartData: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<ChartData>>('/charts', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getPieChartData: async () => {
    const response = await api.get<ApiResponse<PieChartData[]>>('/charts/pie');
    return response.data;
  },

  getColumnChartData: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<ColumnChartData[]>>('/charts/column', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  getMonthlyChartData: async (year: number) => {
    const response = await api.get<ApiResponse<ColumnChartData[]>>(`/charts/monthly/${year}`);
    return response.data;
  },
};

// Upload API
export const uploadApi = {
  getPresignedUrl: async (filename: string, contentType: string = 'image/jpeg') => {
    const response = await api.get<ApiResponse<{ presigned_url: string; public_url: string }>>('/upload/presign', {
      params: { filename, contentType },
    });
    return response.data;
  },

  uploadFile: async (presignedUrl: string, file: File) => {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
  },
};

export default api;
