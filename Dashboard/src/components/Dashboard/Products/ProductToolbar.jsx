import React, { useState } from 'react';
import { Search, Grid, Table, Plus, SlidersHorizontal } from 'lucide-react';
import useDebouncedValue from '../../../Hooks/useDebounce';

const ProductToolbar = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
  view,
  onViewChange,
  onAddProduct,
  loadingProducts
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounce the local search query
  const debouncedSearchQuery = useDebouncedValue(localSearchQuery, 300);

  // Update parent's search query when debounced value changes
  React.useEffect(() => {
    onSearchChange({ target: { value: debouncedSearchQuery } });
  }, [debouncedSearchQuery, onSearchChange]);

  const handleLocalSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Icons */}
      <div className="flex items-center justify-between">
        {/* Center - View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2 rounded-full transition-colors ${
              view === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`p-2 rounded-full transition-colors ${
              view === 'table' ? 'bg-white shadow-sm' : 'text-gray-500'
            }`}
          >
            <Table size={20} />
          </button>
        </div>

        {/* Left side - Search Bar */}
        <div className="flex items-center gap-2">
          {isSearchExpanded && (
            <div className="relative animate-fadeIn">
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleLocalSearchChange}
                placeholder="Search products..."
                className="w-[12rem] sm:w-[18rem] md:w-[24rem] lg:w-[30rem] xl:w-[36rem] 2xl:w-[42rem] p-2 pl-10 border border-gray-200 rounded-lg focus:border-transparent text-sm"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          )}
        </div>

        {/* Right side - Action Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl"
          >
            <Search size={20} />
          </button>
          <button
            onClick={onAddProduct}
            className="p-2 text-white bg-blue-500 rounded-xl hover:bg-blue-600"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Categories Scroll */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => onCategoryChange({ target: { value: '' } })}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !categoryFilter
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryChange({ target: { value: category._id } })}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  categoryFilter === category._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.catName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductToolbar; 