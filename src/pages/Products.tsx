import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Heart, ShoppingBag, Star, Grid, List, Eye, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  images: string[];
  category: string;
  material: string;
  color: string;
  size: string[];
  is_new: boolean;
  is_bestseller: boolean;
  stock_quantity: number;
  created_at: string;
  rating?: number;
  review_count?: number;
}

interface FilterState {
  category: string;
  material: string;
  color: string;
  priceRange: [number, number];
  inStock: boolean;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const ITEMS_PER_PAGE = 20;
const PRICE_RANGES = [
  { label: 'Under ₹500', value: [0, 500] },
  { label: '₹500 - ₹1000', value: [500, 1000] },
  { label: '₹1000 - ₹2000', value: [1000, 2000] },
  { label: '₹2000 - ₹5000', value: [2000, 5000] },
  { label: 'Above ₹5000', value: [5000, 10000] },
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [processingWishlist, setProcessingWishlist] = useState<Set<string>>(new Set());
  const [processingCart, setProcessingCart] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    material: searchParams.get('material') || '',
    color: searchParams.get('color') || '',
    priceRange: [0, 10000],
    inStock: false,
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    hasMore: true,
  });

  // Static data - ideally these would come from backend
  const categories = useMemo(() => ['casual', 'formal', 'party', 'festive'], []);
  // const materials = useMemo(() => ['cotton', 'silk', 'georgette', 'chiffon', 'linen'], []);
  // const colors = useMemo(() => ['red', 'blue', 'green', 'yellow', 'pink', 'white', 'black', 'purple'], []);

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      setSearchParams(params);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    
    setSearchTimeout(timeout);
  }, [searchParams, setSearchParams, searchTimeout]);

  // Optimized product fetching with better error handling
  const fetchProducts = useCallback(async (reset = false) => {
    if (reset) {
      setInitialLoading(true);
      setError(null);
    } else {
      setLoading(true);
    }

    try {
      // Build query with proper indexing considerations
      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, images, category, 
          material, color, size, is_new, is_bestseller, stock_quantity, 
          created_at
        `, { count: 'exact' });

      // Apply filters efficiently
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.material) {
        query = query.eq('material', filters.material);
      }
      if (filters.color) {
        query = query.eq('color', filters.color);
      }
      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      // Price range filter
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
        query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);
      }

      // Apply search with proper text search
      const search = searchParams.get('search');
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popularity':
          query = query.order('is_bestseller', { ascending: false })
                      .order('created_at', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      // Apply pagination
      const startIndex = reset ? 0 : (pagination.page - 1) * pagination.limit;
      query = query.range(startIndex, startIndex + pagination.limit - 1);

      const { data, error, count } = await query;
      
      if (error) throw error;

      const newProducts = data || [];
      
      if (reset) {
        setProducts(newProducts);
        setPagination(prev => ({
          ...prev,
          page: 1,
          total: count || 0,
          hasMore: newProducts.length === pagination.limit,
        }));
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPagination(prev => ({
          ...prev,
          page: prev.page + 1,
          total: count || 0,
          hasMore: newProducts.length === pagination.limit,
        }));
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [filters, sortBy, searchParams, pagination.page, pagination.limit]);

  // Optimized wishlist fetching
  const fetchWishlistItems = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const wishlistProductIds = new Set(data?.map(item => item.product_id) || []);
      setWishlistItems(wishlistProductIds);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  }, [user]);

  // Optimized cart handling with better UX
  const handleAddToCart = useCallback(async (productId: string, sizes: string[]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (processingCart.has(productId)) return;

    setProcessingCart(prev => new Set([...prev, productId]));
    
    try {
      await addToCart(productId, sizes[0]);
      
      // Show success notification (you can implement toast here)
      console.log('Added to cart successfully');
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setTimeout(() => {
        setProcessingCart(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 1000);
    }
  }, [user, addToCart, processingCart]);

  // Optimized wishlist toggle
  const handleWishlistToggle = useCallback(async (productId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (processingWishlist.has(productId)) return;

    setProcessingWishlist(prev => new Set([...prev, productId]));

    try {
      const isInWishlist = wishlistItems.has(productId);
      
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        
        if (error) throw error;
        
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: productId
          });
        
        if (error) throw error;
        
        setWishlistItems(prev => new Set([...prev, productId]));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setError('Failed to update wishlist. Please try again.');
    } finally {
      setProcessingWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [user, wishlistItems, processingWishlist]);

  // Filter handling
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.material) params.set('material', filters.material);
    if (filters.color) params.set('color', filters.color);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'name') params.set('sort', sortBy);
    
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilters(false);
  }, [filters, searchTerm, sortBy, setSearchParams]);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      material: '',
      color: '',
      priceRange: [0, 10000],
      inStock: false,
    });
    setSearchTerm('');
    setSortBy('name');
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [setSearchParams]);

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchProducts(false);
    }
  }, [loading, pagination.hasMore, fetchProducts]);

  // Effects
  useEffect(() => {
    fetchProducts(true);
  }, [searchParams, sortBy, filters]);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user, fetchWishlistItems]);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search !== searchTerm) {
      setSearchTerm(search || '');
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-4">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-6 rounded mb-4"></div>
                <div className="bg-gray-200 h-10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (initialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 mx-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-rose-gold">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-mahogany">Products</span>
            {filters.category && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500 capitalize">{filters.category}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-mahogany">
                Our Kurti Collection
              </h1>
              <p className="text-gray-600 mt-1">
                {pagination.total} products found
                {searchTerm && ` for "${searchTerm}"`}
                {filters.category && ` in ${filters.category}`}
              </p>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search kurtis..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
              >
                <option value="name">Sort by Name</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popularity">Most Popular</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-rose-gold text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-rose-gold text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(filters.category || filters.material || filters.color || filters.inStock) && (
                  <span className="bg-rose-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[filters.category, filters.material, filters.color, filters.inStock].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Improved Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mahogany">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-rose-gold hover:text-rose-800 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="text-rose-gold focus:ring-rose-gold rounded"
                  />
                  <span className="ml-2 text-sm">In Stock Only</span>
                </label>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-mahogany mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="text-rose-gold focus:ring-rose-gold"
                      />
                      <span className="ml-2 text-sm capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Material Filter */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-mahogany mb-3">Material</h4>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <label key={material} className="flex items-center">
                      <input
                        type="radio"
                        name="material"
                        value={material}
                        checked={filters.material === material}
                        onChange={(e) => handleFilterChange('material', e.target.value)}
                        className="text-rose-gold focus:ring-rose-gold"
                      />
                      <span className="ml-2 text-sm capitalize">{material}</span>
                    </label>
                  ))}
                </div>
              </div> */}

              {/* Color Filter */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-mahogany mb-3">Color</h4>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleFilterChange('color', filters.color === color ? '' : color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        filters.color === color ? 'border-mahogany' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div> */}

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-mahogany mb-3">Price Range</h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.label} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1]}
                        onChange={() => handleFilterChange('priceRange', range.value)}
                        className="text-rose-gold focus:ring-rose-gold"
                      />
                      <span className="ml-2 text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-rose-gold text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-rose-gold hover:text-rose-800 font-medium"
                >
                  Clear filters and try again
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                            viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
                          }`}
                          loading="lazy"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {product.is_new && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              New
                            </span>
                          )}
                          {product.is_bestseller && (
                            <span className="bg-rose-gold text-white px-2 py-1 rounded-full text-xs font-medium">
                              Bestseller
                            </span>
                          )}
                          {product.stock_quantity === 0 && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={(e) => handleWishlistToggle(product.id, e)}
                            disabled={processingWishlist.has(product.id)}
                            className={`p-2 rounded-full transition-all duration-300 ${
                              wishlistItems.has(product.id)
                                ? 'bg-rose-gold text-white'
                                : 'bg-white bg-opacity-90 backdrop-blur hover:bg-rose-gold hover:text-white'
                            } ${processingWishlist.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart className={`w-4 h-4 ${wishlistItems.has(product.id) ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product.id, product.size);
                            }}
                            disabled={product.stock_quantity === 0 || processingCart.has(product.id)}
                            className="bg-white bg-opacity-90 backdrop-blur p-2 rounded-full hover:bg-rose-gold hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quick View Overlay */}
                        {/* <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-white text-mahogany px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                        </div> */}
                      </div>

                      <div className="p-6 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-rose-gold font-medium capitalize">{product.category}</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-500 ml-1">{product.rating || 4.8}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-mahogany mb-2 group-hover:text-rose-gold transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {viewMode === 'list' && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-rose-gold">₹{product.price.toLocaleString()}</span>
                            {product.original_price > product.price && (
                              <span className="text-sm text-gray-500 line-through">₹{product.original_price.toLocaleString()}</span>
                            )}
                          </div>
                          {product.original_price > product.price && (
                            <div className="text-sm text-green-600 font-medium">
                              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mb-4">
                          <Link
                            to={`/product/${product.id}`}
                            className="flex-1 bg-gray-100 text-mahogany py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center text-sm"
                          >
                            View Details
                          </Link>
                          <button 
                            onClick={() => handleAddToCart(product.id, product.size)}
                            disabled={product.stock_quantity === 0 || processingCart.has(product.id)}
                            className="flex-1 bg-rose-gold text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {processingCart.has(product.id) ? 'Adding...' : 
                             product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                        </div>

                        {/* Additional info for list view */}
                        {viewMode === 'list' && (
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Material: {product.material}</span>
                            <span>Color: {product.color}</span>
                            <span>Stock: {product.stock_quantity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {pagination.hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreProducts}
                      disabled={loading}
                      className="bg-rose-gold text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}

                {/* Loading indicator for additional products */}
                {loading && pagination.page > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-mahogany mb-4">Sign in required</h3>
            <p className="text-gray-600 mb-6">Please sign in to add items to your cart or wishlist.</p>
            <div className="flex gap-3">
              <Link
                to="/auth"
                onClick={() => setShowAuthModal(false)}
                className="flex-1 bg-rose-gold text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;