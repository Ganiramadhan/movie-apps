import { useQuery } from '@tanstack/react-query';
import { dashboardApi, chartApi } from '../lib/api';
import type { Movie } from '../lib/api';
import { MdMovie, MdStar, MdThumbUp, MdAccessTime, MdTrendingUp, MdLanguage, MdCalendarToday } from 'react-icons/md';
import { getImageUrl, getPlaceholderImage } from '../utils/imageHelpers';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { useState } from 'react';
import MovieDetailModal from '../components/MovieDetailModal';

const COLORS = [
  '#E50914',
  '#46D369',
  '#F5B014',
  '#5A67D8',
  '#ED64A6',
  '#38B2AC',
  '#DD6B20',
  '#9F7AEA',
];

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 sm:p-5 border border-gray-800 hover:border-gray-700 transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg bg-opacity-20 ${iconColor.replace('text-', 'bg-').replace('500', '500/20')}`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-gray-400 text-xs sm:text-sm">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  const posterUrl = getImageUrl(movie.poster_path, 'w200') ?? getPlaceholderImage(200, 300);

  return (
    <div 
      onClick={onClick}
      className="group relative rounded-md overflow-hidden bg-[#2a2a2a] hover:scale-105 transition-transform duration-300 cursor-pointer"
    >
      <img
        src={posterUrl}
        alt={movie.title}
        className="w-full h-32 sm:h-36 md:h-40 object-cover bg-gray-800"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect fill="%232a2a2a" width="200" height="300"/%3E%3Ctext fill="%23666" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-xs sm:text-sm text-white truncate" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1 sm:mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MdStar className="w-3 h-3 text-yellow-500" />
            {movie.vote_average?.toFixed(1)}
          </span>
          <span className="text-xs">{movie.release_date?.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 12), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: chartResponse, isLoading: chartLoading } = useQuery({
    queryKey: ['chart-data', startDate, endDate],
    queryFn: () => chartApi.getChartData(startDate, endDate),
  });

  const stats = statsResponse?.data;
  const chartData = chartResponse?.data;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Data overview and analytics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={MdMovie}
          label="Total Movies"
          value={stats?.total_movies || 0}
          iconColor="text-red-500"
        />
        <StatCard
          icon={MdStar}
          label="Average Rating"
          value={stats?.average_rating?.toFixed(2) || '0.00'}
          iconColor="text-yellow-500"
        />
        <StatCard
          icon={MdThumbUp}
          label="Total Votes"
          value={(stats?.total_votes || 0).toLocaleString()}
          iconColor="text-green-500"
        />
        <StatCard
          icon={MdAccessTime}
          label="Last Sync"
          value={
            stats?.last_sync_time
              ? format(new Date(stats.last_sync_time), 'dd/MM/yyyy HH:mm')
              : 'Never'
          }
          iconColor="text-purple-500"
        />
      </div>

      {/* Date Filter */}
      <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <MdCalendarToday className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <span className="text-gray-300 font-medium text-xs sm:text-sm">Filter Date Range:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              title="Start Date"
              className="bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none flex-1 sm:flex-initial min-w-[130px]"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              title="End Date"
              className="bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none flex-1 sm:flex-initial min-w-[130px]"
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pie Chart - By Language */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MdLanguage className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            Movies by Language
          </h2>
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
            </div>
          ) : (chartData?.pie_chart?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(chartData?.pie_chart || []) as unknown as Array<Record<string, unknown>>}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: '#666' }}
                >
                  {(chartData?.pie_chart || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Column Chart - By Year */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MdTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            Movies by Release Year
          </h2>
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
            </div>
          ) : (chartData?.column_chart?.length || 0) > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.column_chart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="label" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Bar dataKey="value" name="Movies" fill="#E50914" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Movie Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Rated */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MdStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Top Rated Movies
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {stats?.top_rated_movies?.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
            ))}
          </div>
        </div>

        {/* Most Popular */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MdTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            Most Popular
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {stats?.most_popular?.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 border border-gray-800">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <MdAccessTime className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            Recently Added
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {stats?.recently_added?.slice(0, 4).map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
            ))}
          </div>
        </div>
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
