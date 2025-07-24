import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Zap, ArrowRight, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

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

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [processingWishlist, setProcessingWishlist] = useState<Set<string>>(new Set());
  const [processingCart, setProcessingCart] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Fetch featured products - using bestsellers and new arrivals as featured
  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, images, category, 
          material, color, size, is_new, is_bestseller, stock_quantity, 
          created_at
        `)
        .or('is_bestseller.eq.true,is_new.eq.true') // Get bestsellers or new products
        .gt('stock_quantity', 0) // Only in-stock items
        .order('is_bestseller', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wishlist items
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

  // Optimized cart handling
  const handleAddToCart = useCallback(async (productId: string, sizes: string[]) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (processingCart.has(productId)) return;

    setProcessingCart(prev => new Set([...prev, productId]));
    
    try {
      await addToCart(productId, sizes[0]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
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
      setError('Failed to update wishlist');
    } finally {
      setProcessingWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [user, wishlistItems, processingWishlist]);

  // Effects
  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setWishlistItems(new Set());
    }
  }, [user, fetchWishlistItems]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-12 w-96 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-2xl p-4">
                <div className="bg-gray-200 h-64 rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-6 rounded mb-4"></div>
                <div className="bg-gray-200 h-10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-white px-4 sm:px-6 py-2 rounded-full text-rose-gold font-medium mb-4 shadow-sm text-sm sm:text-base">
            Featured Collection
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mahogany mb-4 sm:mb-6">
            Trending <span className="text-rose-gold">Kurtis</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our most popular and newest kurti designs loved by thousands of customers
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center text-rose-gold hover:text-rose-800 font-medium"
            >
              Browse All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 sm:h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_new && (
                      <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                    {product.is_bestseller && (
                      <span className="bg-rose-gold text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Bestseller
                      </span>
                    )}
                    {product.stock_quantity === 0 && (
                      <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
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
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <Link
                      to={`/product/${product.id}`}
                      className="bg-white text-mahogany px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-rose-gold font-medium capitalize">{product.category}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-xs sm:text-sm text-gray-500 ml-1">{product.rating || 4.8}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-mahogany mb-3 group-hover:text-rose-gold transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg sm:text-xl font-bold text-rose-gold">₹{product.price.toLocaleString()}</span>
                      {product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                    {product.original_price > product.price && (
                      <div className="text-xs text-green-600 font-medium">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="flex-1 bg-gray-100 text-mahogany py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center text-sm sm:text-base"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(product.id, product.size)}
                      disabled={product.stock_quantity === 0 || processingCart.has(product.id)}
                      className="flex-1 bg-gradient-to-r from-rose-gold to-copper text-white py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {processingCart.has(product.id) ? 'Adding...' : 
                       product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center bg-white border-2 border-rose-gold text-rose-gold px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 shadow-lg"
          >
            View All Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
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
    </section>
  );
};

export default FeaturedProducts;
