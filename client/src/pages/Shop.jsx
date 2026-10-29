import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, ChevronDown, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../api/client';

export default function Shop({ initialFilters = {}, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [brand, setBrand] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState(initialFilters.sort || 'newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Dynamic filter options from server
  const [availableCategories, setAvailableCategories] = useState(['Men', 'Women', 'Sports', 'Casual', 'Running']);
  const [availableBrands, setAvailableBrands] = useState(['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Salomon', 'Converse']);
  const standardSizes = [6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    if (initialFilters.category !== undefined) {
      setCategory(initialFilters.category || '');
    }
    if (initialFilters.search !== undefined) {
      setSearch(initialFilters.search || '');
    }
  }, [initialFilters]);

  useEffect(() => {
    fetchProducts();
  }, [search, category, brand, selectedSize, minPrice, maxPrice, sort, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (selectedSize) params.size = selectedSize;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await productsApi.getAll(params);
      if (res.success) {
        setProducts(res.data);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);

        if (res.filters?.categories?.length > 0) {
          setAvailableCategories(res.filters.categories);
        }
        if (res.filters?.brands?.length > 0) {
          setAvailableBrands(res.filters.brands);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || category || brand || selectedSize || minPrice || maxPrice || sort !== 'newest'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight uppercase">
            {category ? `${category} Footwear` : 'All Shoes'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {products.length} of {totalCount} authentic sneaker models
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-xs font-bold text-zinc-800"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <span className="text-xs text-zinc-400 mr-2 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-zinc-100 hover:bg-zinc-200 text-xs font-bold rounded-full px-4 py-2 border-none focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Left Sidebar Filters (Desktop & Mobile) */}
        <aside
          className={`space-y-6 md:block ${
            mobileFilterOpen
              ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
              : 'hidden'
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 md:hidden">
              <h2 className="text-base font-bold">Filter Shoes</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Clear Filters CTA */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}

          {/* Search Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Model, tech, color..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 pl-8 focus:outline-none focus:border-zinc-900"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5 pointer-events-none" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-zinc-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Category
            </label>
            <div className="space-y-1">
              <button
                onClick={() => { setCategory(''); setPage(1); }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition ${
                  category === ''
                    ? 'bg-zinc-950 text-white font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100 font-medium'
                }`}
              >
                All Categories
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition ${
                    category === cat
                      ? 'bg-zinc-950 text-white font-bold'
                      : 'text-zinc-600 hover:bg-zinc-100 font-medium'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Brand
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setBrand(''); setPage(1); }}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  brand === ''
                    ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                All Brands
              </button>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => { setBrand(b); setPage(1); }}
                  className={`px-3 py-1 text-xs rounded-full border transition ${
                    brand === b
                      ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Shoe Size (UK/US)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {standardSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setSelectedSize(selectedSize === String(sz) ? '' : String(sz));
                    setPage(1);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                    selectedSize === String(sz)
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-zinc-950 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider mt-4"
            >
              Apply Filters ({totalCount} Results)
            </button>
          )}
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-zinc-100 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-zinc-200 p-8">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">No shoes found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                We couldn't find any shoes matching your selected filters. Try broadening your criteria or search term.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-5 bg-zinc-950 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-zinc-100">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-100 disabled:opacity-30 transition"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-zinc-500 font-semibold px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 border border-zinc-200 text-xs font-bold rounded-xl hover:bg-zinc-100 disabled:opacity-30 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
