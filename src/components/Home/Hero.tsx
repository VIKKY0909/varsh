import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Adjust path as needed

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

const Hero = () => {
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured product
  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch one featured product (preferably bestseller or newest)
        let query = supabase
          .from('products')
          .select(`
            id, name, description, price, original_price, images, category, 
            material, color, size, is_new, is_bestseller, stock_quantity, 
            created_at, rating, review_count
          `)
          .gt('stock_quantity', 0) // Only in-stock items
          .limit(1);

        // Priority: bestseller > new > random
        const { data: bestsellerData } = await query.eq('is_bestseller', true).order('created_at', { ascending: false });
        
        if (bestsellerData && bestsellerData.length > 0) {
          setFeaturedProduct(bestsellerData[0]);
        } else {
          // Fallback to newest product
          const { data: newData } = await query.eq('is_new', true).order('created_at', { ascending: false });
          
          if (newData && newData.length > 0) {
            setFeaturedProduct(newData[0]);
          } else {
            // Final fallback to any product
            const { data: anyData, error: anyError } = await supabase
              .from('products')
              .select(`
                id, name, description, price, original_price, images, category, 
                material, color, size, is_new, is_bestseller, stock_quantity, 
                created_at, rating, review_count
              `)
              .gt('stock_quantity', 0)
              .order('created_at', { ascending: false })
              .limit(1);

            if (anyError) throw anyError;
            setFeaturedProduct(anyData?.[0] || null);
          }
        }
      } catch (err) {
        console.error('Error fetching featured product:', err);
        setError('Failed to load featured product');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProduct();
  }, []);

  const handleViewProduct = () => {
    if (featuredProduct) {
      // Replace with your navigation logic
      // navigate(`/product/${featuredProduct.id}`);
      window.location.href = `/product/${featuredProduct.id}`;
    }
  };

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B76E79' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm15-15c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ New Collection Arrived
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold text-mahogany leading-tight mb-6">
              Timeless
              <span className="block text-rose-gold">Ethnic</span>
              <span className="block">Elegance</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Discover handcrafted ethnic wear that celebrates tradition while embracing contemporary style. Each piece tells a story of heritage and artistry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group">
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="border-2 border-rose-gold text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300">
                Watch Our Story
              </button>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-mahogany">10k+</div>
                <div className="text-sm text-gray-500">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-mahogany">500+</div>
                <div className="text-sm text-gray-500">Unique Designs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-mahogany">25+</div>
                <div className="text-sm text-gray-500">Years of Craftsmanship</div>
              </div>
            </div>
          </div>

          {/* Right Content - Dynamic Featured Product */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-pink to-rose-gold rounded-3xl transform rotate-6 opacity-20"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              {loading ? (
                // Loading skeleton
                <div className="w-full h-96 lg:h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">Loading featured product...</div>
                </div>
              ) : error ? (
                // Error state
                <div className="w-full h-96 lg:h-[500px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-red-500 mb-2">⚠️ {error}</p>
                    <p className="text-sm">Please check back later</p>
                  </div>
                </div>
              ) : featuredProduct ? (
                <>
                  {/* Product Badges */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    {featuredProduct.is_new && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                    {featuredProduct.is_bestseller && (
                      <span className="bg-rose-gold text-white px-2 py-1 rounded-full text-xs font-medium">
                        Bestseller
                      </span>
                    )}
                    {featuredProduct.original_price > featuredProduct.price && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {getDiscountPercentage(featuredProduct.original_price, featuredProduct.price)}% OFF
                      </span>
                    )}
                  </div>

                  <img
                    src={featuredProduct.images?.[0] || "https://images.pexels.com/photos/6146970/pexels-photo-6146970.jpeg?auto=compress&cs=tinysrgb&w=800"}
                    alt={featuredProduct.name}
                    className="w-full h-96 lg:h-[500px] object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.pexels.com/photos/6146970/pexels-photo-6146970.jpeg?auto=compress&cs=tinysrgb&w=800";
                    }}
                  />
                  
                  <div className="absolute bottom-6 left-6 right-6 bg-white bg-opacity-95 backdrop-blur rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-mahogany mb-1 line-clamp-1">
                          Featured: {featuredProduct.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {featuredProduct.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {featuredProduct.category}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {featuredProduct.material}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {featuredProduct.color}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-gold font-bold text-lg">
                          ₹{featuredProduct.price.toLocaleString()}
                        </span>
                        {featuredProduct.original_price > featuredProduct.price && (
                          <span className="text-gray-400 line-through text-sm">
                            ₹{featuredProduct.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {featuredProduct.rating && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>⭐</span>
                            <span>{featuredProduct.rating.toFixed(1)}</span>
                            {featuredProduct.review_count && (
                              <span>({featuredProduct.review_count})</span>
                            )}
                          </div>
                        )}
                        
                        <button 
                          className="text-sm text-rose-gold hover:text-mahogany transition-colors font-medium"
                          onClick={handleViewProduct}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                    
                    {featuredProduct.stock_quantity <= 5 && (
                      <div className="mt-2 text-xs text-red-500">
                        Only {featuredProduct.stock_quantity} left in stock!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // No product found
                <div className="w-full h-96 lg:h-[500px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>No featured product available</p>
                    <p className="text-sm">Please check back later</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
