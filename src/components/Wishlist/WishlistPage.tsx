import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, Share2, Bell, BellOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface WishlistItem {
  id: string;
  product_id: string;
  notify_on_stock: boolean;
  notify_on_price_drop: boolean;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number;
    images: string[];
    category: string;
    size: string[];
    stock_quantity: number;
  };
}

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setWishlistItems(items => items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const toggleNotification = async (itemId: string, type: 'stock' | 'price') => {
    const item = wishlistItems.find(item => item.id === itemId);
    if (!item) return;

    const updateField = type === 'stock' ? 'notify_on_stock' : 'notify_on_price_drop';
    const newValue = !item[updateField];

    try {
      const { error } = await supabase
        .from('wishlist')
        .update({ [updateField]: newValue })
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, [updateField]: newValue } : item
        )
      );
    } catch (error) {
      console.error('Error updating notification preference:', error);
    }
  };

  const handleAddToCart = async (productId: string, sizes: string[]) => {
    if (!user) return;
    await addToCart(productId, sizes[0]);
  };

  const shareWishlist = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist - Varsh Kurtis',
          text: 'Check out my wishlist of beautiful kurtis!',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Wishlist link copied to clipboard!');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Wishlist link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-6 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-mahogany">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{wishlistItems.length} items saved</p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={shareWishlist}
              className="flex items-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Wishlist
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-mahogany mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Save your favorite kurtis to your wishlist and never lose track of them.
            </p>
            <a
              href="/products"
              className="inline-flex items-center bg-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
            >
              Explore Kurtis
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Stock Status */}
                  {item.product.stock_quantity === 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-sm text-rose-gold font-medium capitalize">
                      {item.product.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-mahogany mb-3 line-clamp-2">
                    {item.product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-rose-gold">
                        ₹{item.product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.product.original_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {Math.round(((item.product.original_price - item.product.price) / item.product.original_price) * 100)}% OFF
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <button
                      onClick={() => toggleNotification(item.id, 'stock')}
                      className={`flex items-center gap-1 ${
                        item.notify_on_stock ? 'text-rose-gold' : 'text-gray-400'
                      }`}
                    >
                      {item.notify_on_stock ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      Stock Alert
                    </button>
                    <button
                      onClick={() => toggleNotification(item.id, 'price')}
                      className={`flex items-center gap-1 ${
                        item.notify_on_price_drop ? 'text-rose-gold' : 'text-gray-400'
                      }`}
                    >
                      {item.notify_on_price_drop ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      Price Drop
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.product_id, item.product.size)}
                      disabled={item.product.stock_quantity === 0}
                      className="flex-1 bg-rose-gold text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {item.product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Added on {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;