import { useState, useEffect } from 'react';
import { MdClose, MdSave, MdCloudUpload } from 'react-icons/md';
import type { Movie } from '../../lib/api';
import { uploadApi } from '../../lib/api';
import { SearchableSelect } from './SearchableSelect';
import { getImageUrl } from '../../utils/imageHelpers';
import toast from 'react-hot-toast';

interface MovieFormData {
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  original_language: string;
  tmdb_id: number;
}

interface MovieModalProps {
  isOpen: boolean;
  editingMovie: Movie | null;
  formData: MovieFormData;
  onFormDataChange: (data: MovieFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, overrideData?: Partial<MovieFormData>) => void;
  isSubmitting: boolean;
  languageOptions: { value: string; label: string }[];
}

export function MovieModal({
  isOpen,
  editingMovie,
  formData,
  onFormDataChange,
  onClose,
  onSubmit,
  isSubmitting,
  languageOptions,
}: MovieModalProps) {
  const [selectedPosterFile, setSelectedPosterFile] = useState<File | null>(null);
  const [selectedBackdropFile, setSelectedBackdropFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [backdropPreview, setBackdropPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Reset preview states when modal opens or editingMovie changes
  useEffect(() => {
    if (isOpen) {
      // Reset file selections
      setSelectedPosterFile(null);
      setSelectedBackdropFile(null);
      
      // Set previews from formData (for edit mode) or empty (for create mode)
      // Use getImageUrl to properly handle TMDB and MinIO URLs
      const posterUrl = formData.poster_path ? (getImageUrl(formData.poster_path, 'w500') || formData.poster_path) : '';
      const backdropUrl = formData.backdrop_path ? (getImageUrl(formData.backdrop_path, 'w1280') || formData.backdrop_path) : '';
      
      setPosterPreview(posterUrl);
      setBackdropPreview(backdropUrl);
    }
  }, [isOpen, editingMovie, formData.poster_path, formData.backdrop_path]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'backdrop') => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      if (type === 'poster') {
        setSelectedPosterFile(file);
      } else {
        setSelectedBackdropFile(file);
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'poster') {
          setPosterPreview(reader.result as string);
        } else {
          setBackdropPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitWithUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    let posterUrl = formData.poster_path;
    let backdropUrl = formData.backdrop_path;

    setIsUploading(true);
    try {
      // Upload poster if selected
      if (selectedPosterFile) {
        const presignResponse = await uploadApi.getPresignedUrl(selectedPosterFile.name, selectedPosterFile.type);
        await uploadApi.uploadFile(presignResponse.data.presigned_url, selectedPosterFile);
        posterUrl = presignResponse.data.public_url;
        console.log('Uploaded poster URL:', posterUrl);
      }

      // Upload backdrop if selected
      if (selectedBackdropFile) {
        const presignResponse = await uploadApi.getPresignedUrl(selectedBackdropFile.name, selectedBackdropFile.type);
        await uploadApi.uploadFile(presignResponse.data.presigned_url, selectedBackdropFile);
        backdropUrl = presignResponse.data.public_url;
        console.log('Uploaded backdrop URL:', backdropUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
      return;
    } finally {
      setIsUploading(false);
    }

    // Update form data with new URLs
    const updatedFormData = { ...formData, poster_path: posterUrl, backdrop_path: backdropUrl };
    onFormDataChange(updatedFormData);
    
    // Submit with the updated URLs directly
    onSubmit(e, { poster_path: posterUrl, backdrop_path: backdropUrl });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-[#1a1a1a] rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#1a1a1a] z-10">
          <h2 className="text-xl font-bold text-white">
            {editingMovie ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400"
            title="Close Modal"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmitWithUpload} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                placeholder="Enter movie title"
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Original Title
              </label>
              <input
                type="text"
                value={formData.original_title}
                onChange={(e) =>
                  onFormDataChange({ ...formData, original_title: e.target.value })
                }
                placeholder="Original title"
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Overview
            </label>
            <textarea
              rows={3}
              value={formData.overview}
              onChange={(e) => onFormDataChange({ ...formData, overview: e.target.value })}
              placeholder="Movie description..."
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Release Date
              </label>
              <input
                type="date"
                value={formData.release_date}
                onChange={(e) =>
                  onFormDataChange({ ...formData, release_date: e.target.value })
                }
                title="Release Date"
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Language
              </label>
              <SearchableSelect
                value={formData.original_language}
                onChange={(value) =>
                  onFormDataChange({ ...formData, original_language: value })
                }
                options={languageOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Rating (0-10)
              </label>
              <input
                type="text"
                value={formData.vote_average}
                onChange={(e) => {
                  const value = e.target.value.replace(',', '.');
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
                    onFormDataChange({ ...formData, vote_average: numValue });
                  } else if (value === '' || value === '0') {
                    onFormDataChange({ ...formData, vote_average: 0 });
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value.replace(',', '.')) || 0;
                  onFormDataChange({ ...formData, vote_average: Math.min(10, Math.max(0, value)) });
                }}
                placeholder="0.0"
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                TMDB ID
              </label>
              <input
                type="number"
                value={formData.tmdb_id}
                onChange={(e) =>
                  onFormDataChange({ ...formData, tmdb_id: parseInt(e.target.value) || 0 })
                }
                placeholder="Auto-generated"
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Poster Image
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md cursor-pointer transition-colors">
                  <MdCloudUpload className="w-5 h-5" />
                  <span className="text-sm">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'poster')}
                    className="hidden"
                  />
                </label>
                {selectedPosterFile && (
                  <span className="text-sm text-gray-400">{selectedPosterFile.name}</span>
                )}
              </div>
              
              {posterPreview && (
                <div className="relative w-32 h-48 rounded-md overflow-hidden border border-gray-700">
                  <img
                    src={posterPreview}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="relative">
                <label className="block text-xs text-gray-400 mb-1">Or enter URL manually:</label>
                <input
                  type="text"
                  placeholder="/path/to/poster.jpg or https://..."
                  value={formData.poster_path}
                  onChange={(e) => {
                    onFormDataChange({ ...formData, poster_path: e.target.value });
                    if (e.target.value && !selectedPosterFile) {
                      const previewUrl = e.target.value.startsWith('http')
                        ? e.target.value
                        : e.target.value.startsWith('/')
                        ? `https://image.tmdb.org/t/p/w500${e.target.value}`
                        : e.target.value;
                      setPosterPreview(previewUrl);
                    }
                  }}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Backdrop Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Backdrop Image
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md cursor-pointer transition-colors">
                  <MdCloudUpload className="w-5 h-5" />
                  <span className="text-sm">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'backdrop')}
                    className="hidden"
                  />
                </label>
                {selectedBackdropFile && (
                  <span className="text-sm text-gray-400">{selectedBackdropFile.name}</span>
                )}
              </div>
              
              {backdropPreview && (
                <div className="relative w-48 h-28 rounded-md overflow-hidden border border-gray-700">
                  <img
                    src={backdropPreview}
                    alt="Backdrop Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="relative">
                <label className="block text-xs text-gray-400 mb-1">Or enter URL manually:</label>
                <input
                  type="text"
                  placeholder="/path/to/backdrop.jpg or https://..."
                  value={formData.backdrop_path}
                  onChange={(e) => {
                    onFormDataChange({ ...formData, backdrop_path: e.target.value });
                    if (e.target.value && !selectedBackdropFile) {
                      const previewUrl = e.target.value.startsWith('http')
                        ? e.target.value
                        : e.target.value.startsWith('/')
                        ? `https://image.tmdb.org/t/p/w1280${e.target.value}`
                        : e.target.value;
                      setBackdropPreview(previewUrl);
                    }
                  }}
                  className="w-full bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4" />
                  {editingMovie ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
