import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function SearchableSelect({ value, onChange, options }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none text-sm text-left flex items-center justify-between"
      >
        <span>{selectedOption ? `${selectedOption.label} (${selectedOption.value})` : 'Select language'}</span>
        <svg className={`fill-current h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-[#2a2a2a] border border-gray-700 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              placeholder="Search language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-2 py-1.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                    value === option.value ? 'bg-gray-700 text-red-500' : 'text-white'
                  }`}
                >
                  {option.label} ({option.value})
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
