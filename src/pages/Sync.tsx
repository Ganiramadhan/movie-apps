import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '../lib/api';
import {
  MdSync,
  MdAccessTime,
  MdCheckCircle,
  MdError,
  MdStorage,
  MdMovie,
  MdInfo,
} from 'react-icons/md';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import toast from 'react-hot-toast';

export function Sync() {
  const queryClient = useQueryClient();
  const [pages, setPages] = useState(1);

  const { data: lastSyncResponse, isLoading: lastSyncLoading } = useQuery({
    queryKey: ['last-sync-log'],
    queryFn: () => syncApi.getLastSyncLog(),
  });

  const syncMutation = useMutation({
    mutationFn: (pages: number) => syncApi.syncMovies(pages),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['last-sync-log'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['chart-data'] });
      toast.success(`Successfully synced ${data.data.movies_added} movies!`);
    },
    onError: () => {
      toast.error('Failed to sync movies from TMDB');
    },
  });

  const lastSync = lastSyncResponse?.data;

  const handleSync = () => {
    syncMutation.mutate(pages);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Data Synchronization</h1>
        <p className="text-gray-400 text-sm">Sync movies from TMDB API</p>
      </div>

      {/* Sync Action Card */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="p-4 bg-red-900/20 rounded-lg self-start">
            <MdStorage className="w-10 h-10 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">Sync Data from TMDB</h2>
            <p className="text-gray-400 mb-5 text-sm leading-relaxed">
              Fetch popular movies from TMDB API and save them to the local database.
              New movies will be added and existing ones will be updated automatically.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-300">Pages to fetch:</label>
                <select
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  title="Select number of pages"
                  className="bg-[#2a2a2a] border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  disabled={syncMutation.isPending}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <option key={p} value={p}>
                      {p} page{p > 1 ? 's' : ''} (~{p * 20} movies)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {syncMutation.isPending ? (
                <>
                  <MdSync className="w-5 h-5 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <MdSync className="w-5 h-5" />
                  Sync Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Result */}
      {syncMutation.data && (
        <div
          className={`rounded-lg p-5 border ${
            syncMutation.data.data?.status === 'success'
              ? 'bg-green-900/10 border-green-800'
              : 'bg-red-900/10 border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            {syncMutation.data.data?.status === 'success' ? (
              <MdCheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
            ) : (
              <MdError className="w-8 h-8 text-red-500 flex-shrink-0" />
            )}
            <div>
              <h3
                className={`text-lg font-bold ${
                  syncMutation.data.data?.status === 'success'
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {syncMutation.data.data?.status === 'success'
                  ? 'Sync Completed Successfully!'
                  : 'Sync Failed'}
              </h3>
              {syncMutation.data.data && (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-gray-300 flex items-center gap-2">
                    <MdMovie className="w-4 h-4 text-gray-500" />
                    Movies added: <strong className="text-white">{syncMutation.data.data.movies_added}</strong>
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    <MdSync className="w-4 h-4 text-gray-500" />
                    Movies updated: <strong className="text-white">{syncMutation.data.data.movies_updated}</strong>
                  </p>
                  {syncMutation.data.data.error_message && (
                    <p className="text-red-400 flex items-center gap-2">
                      <MdError className="w-4 h-4" />
                      Error: {syncMutation.data.data.error_message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Last Sync Info */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <MdAccessTime className="w-5 h-5 text-gray-400" />
          Last Sync Information
        </h2>

        {lastSyncLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
          </div>
        ) : lastSync ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#0d0d0d] rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Sync Time</p>
              <p className="font-semibold text-white text-sm">
                {format(new Date(lastSync.synced_at), 'dd MMM yyyy HH:mm:ss')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(lastSync.synced_at), {
                  addSuffix: true,
                  locale: idLocale,
                })}
              </p>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                {lastSync.status === 'success' ? (
                  <>
                    <MdCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-400">Success</span>
                  </>
                ) : (
                  <>
                    <MdError className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-red-400">Failed</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Movies Added</p>
              <p className="text-2xl font-bold text-red-500">{lastSync.movies_added}</p>
            </div>

            <div className="p-4 bg-[#0d0d0d] rounded-lg border border-gray-800">
              <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wider">Movies Updated</p>
              <p className="text-2xl font-bold text-green-500">{lastSync.movies_updated}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <MdStorage className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No sync history found</p>
            <p className="text-sm text-gray-600 mt-1">Click "Sync Data" to fetch movies from TMDB</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <MdInfo className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-2">About Sync Feature</h3>
            <ul className="text-sm text-gray-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                Data is fetched from TMDB's popular movies endpoint
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                Each page contains approximately 20 movies
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                Existing movies (matched by TMDB ID) will be updated
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                New movies will be added to the database
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                Duplicate entries are automatically prevented
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
