import { MdSearch, MdClose, MdCalendarToday } from 'react-icons/md';

interface FilterSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearSearch: () => void;
  onClearDateFilter: () => void;
}

export function FilterSection({
  search,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearSearch,
  onClearDateFilter,
}: FilterSectionProps) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-3 sm:p-4 border border-gray-800">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#2a2a2a] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
          />
          {search && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              title="Clear search"
            >
              <MdClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <MdCalendarToday className="w-5 h-5 text-gray-500 hidden sm:block" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            placeholder="Start Date"
            title="Start Date"
            className="bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none flex-1 sm:flex-initial min-w-[140px]"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            placeholder="End Date"
            title="End Date"
            className="bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 outline-none flex-1 sm:flex-initial min-w-[140px]"
          />
          {(startDate || endDate) && (
            <button
              onClick={onClearDateFilter}
              className="text-gray-400 hover:text-white transition-colors"
              title="Clear Date Filter"
            >
              <MdClose className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
