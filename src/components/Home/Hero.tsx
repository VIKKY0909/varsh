import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import heroImg from "../../lib/5dec5227-cf34-4607-a33e-21c33efd7203_20250725_014719_0000.jpg";
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
  created_at: string;
}

const Hero = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  // Fetch latest 3 featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching featured products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Featured products fetched:', data);
        setFeaturedProducts(data || []);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) => 
        (prevIndex + 1) % featuredProducts.length
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [featuredProducts.length]);


  const currentProduct = featuredProducts[currentProductIndex];

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
          {/* Left Content - Order 2 on mobile, 1 on desktop */}
          <div className="text-left order-2 lg:order-1">
            <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ New Collection Arrived
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-mahogany leading-tight mb-6">
              Premium
              <span className="block text-rose-gold">Handcrafted</span>
              <span className="block">Kurtis</span>
            </h1>
            
            <h2 className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Discover <Link to="/products" className="text-rose-gold hover:text-mahogany font-semibold">handcrafted ethnic wear</Link> that celebrates tradition while embracing contemporary style. Each piece tells a story of <Link to="/about" className="text-rose-gold hover:text-mahogany font-semibold">heritage and artistry</Link>.
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  console.log('Explore Collection clicked - navigating to products page');
                  navigate('/products');
                }} 
                className="bg-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => navigate('/about')} className="border-2 border-rose-gold text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300">
                Watch Our Story
              </button>
            </div>
            
            {/* Stats */}
{/*             <div className="flex gap-8 mt-12">
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
            </div> */}
          </div>

          {/* Right Content - Image - Order 1 on mobile, 2 on desktop */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-pink to-rose-gold rounded-3xl transform rotate-6 opacity-20"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              {loading ? (
                <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-blush-pink to-rose-gold opacity-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-gold mx-auto mb-4"></div>
                    <p className="text-mahogany">Loading featured products...</p>
                  </div>
                </div>
              ) : !currentProduct ? (
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
                  <img
                    src={currentProduct.images && currentProduct.images.length > 0 
                      ? currentProduct.images[0] 
                      : heroImg
                    }
                    alt={currentProduct.name || "Beautiful ethnic wear model"}
                    className="w-full h-96 lg:h-[500px] object-cover transition-opacity duration-500"
                  />
                </>
              )}
              
              {/* Featured Product Info */}
              <div className="absolute bottom-6 left-6 right-6 bg-white bg-opacity-95 backdrop-blur rounded-xl p-4 transition-all duration-500">
                {currentProduct && !loading ? (
                  <>
                    <h3 className="font-semibold text-mahogany mb-1">
                      Featured: {currentProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {currentProduct.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-gold font-bold">₹{currentProduct.price?.toLocaleString()}</span>
                        {currentProduct.original_price > currentProduct.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{currentProduct.original_price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => {
                          console.log('View Details clicked for product:', currentProduct.id);
                          navigate(`/product/${currentProduct.id}`);
                        }} 
                        className="text-sm text-rose-gold hover:text-mahogany transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-mahogany mb-1">Featured: IndiRatri</h3>
                    <p className="text-sm text-gray-600">Infuse elegance into your everyday wardrobe with our IndiRatri Cotton Kurti</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-rose-gold font-bold">From ₹449</span>
                      <button 
                        onClick={() => {
                          console.log('View Details clicked - navigating to products page');
                          navigate('/products');
                        }} 
                        className="text-sm text-rose-gold hover:text-mahogany transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Slide indicators */}
              {featuredProducts.length > 1 && (
                <div className="absolute top-6 right-6 flex gap-2">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentProductIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentProductIndex 
                          ? 'bg-rose-gold w-6' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
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
