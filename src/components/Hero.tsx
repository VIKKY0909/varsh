import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(false);

  // Fetch featured product from database
  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        setProductLoading(true);
        setProductError(false);

        const { data, error } = await supabase
          .from('products')
          .select('id, name, description, price, original_price, images, category, material, color, size, is_new, is_bestseller, stock_quantity')
          .eq('is_bestseller', true)
          .gt('stock_quantity', 0)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching featured product:', error);
          setProductError(true);
          return;
        }

        if (data) {
          setFeaturedProduct(data);
        } else {
          setProductError(true);
        }
      } catch (error) {
        console.error('Error fetching featured product:', error);
        setProductError(true);
      } finally {
        setProductLoading(false);
      }
    };

    fetchFeaturedProduct();
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
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

          {/* Right Content - Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-pink to-rose-gold rounded-3xl transform rotate-6 opacity-20"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              {productLoading ? (
                <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-blush-pink to-rose-gold opacity-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-gold mx-auto mb-4"></div>
                    <p className="text-mahogany">Loading featured product...</p>
                  </div>
                </div>
              ) : productError || !featuredProduct ? (
                <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-blush-pink to-rose-gold opacity-30 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-mahogany mb-2">Featured Collection</h3>
                    <p className="text-gray-600 text-sm">Exquisite ethnic wear crafted with love</p>
                  </div>
                </div>
              ) : (
                <>
                  {!imageError ? (
                    <>
                      <img
                        src={featuredProduct.images && featuredProduct.images.length > 0 
                          ? featuredProduct.images[0] 
                          : "https://images.pexels.com/photos/6146970/pexels-photo-6146970.jpeg?auto=compress&cs=tinysrgb&w=800"
                        }
                        alt={featuredProduct.name || "Beautiful ethnic wear model"}
                        className={`w-full h-96 lg:h-[500px] object-cover transition-opacity duration-300 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                      {!imageLoaded && (
                        <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-blush-pink to-rose-gold opacity-20 flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-gold mx-auto mb-4"></div>
                            <p className="text-mahogany">Loading image...</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-blush-pink to-rose-gold opacity-30 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-mahogany mb-2">Featured Collection</h3>
                        <p className="text-gray-600 text-sm">Exquisite ethnic wear crafted with love</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Featured Product Info - Show real data or fallback */}
              <div className="absolute bottom-6 left-6 right-6 bg-white bg-opacity-95 backdrop-blur rounded-xl p-4">
                {featuredProduct && !productError ? (
                  <>
                    <h3 className="font-semibold text-mahogany mb-1">
                      Featured: {featuredProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {featuredProduct.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-gold font-bold">₹{featuredProduct.price?.toLocaleString()}</span>
                        {featuredProduct.original_price > featuredProduct.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{featuredProduct.original_price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button className="text-sm text-rose-gold hover:text-mahogany transition-colors">
                        View Details →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-mahogany mb-1">Featured: Royal Silk Collection</h3>
                    <p className="text-sm text-gray-600">Handwoven silk sarees with gold thread work</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-rose-gold font-bold">From ₹15,999</span>
                      <button className="text-sm text-rose-gold hover:text-mahogany transition-colors">
                        View Details →
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
