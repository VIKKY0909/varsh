import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Share2, Star, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Plus, Minus, Facebook, Twitter, Instagram } from 'lucide-react';
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
  care_instructions: string;
  stock_quantity: number;
  is_new: boolean;
  is_bestseller: boolean;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct();
      checkWishlistStatus();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setProduct(data);
      setSelectedSize(data.size[0] || '');
      
      // Fetch related products
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);
      
      setRelatedProducts(related || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .maybeSingle();

      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    await addToCart(id!, selectedSize, quantity);
    // Show success message or toast
  };

  const handleBuyNow = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    await addToCart(id!, selectedSize, quantity);
    navigate('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isInWishlist) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);
        setIsInWishlist(false);
      } else {
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: id
          });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out this beautiful kurti: ${product?.name}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: product?.name, text, url });
        } else {
          navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-lg"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 rounded"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mahogany mb-4">Product Not Found</h2>
          <Link to="/products" className="text-rose-gold hover:text-rose-800">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = Math.round(((product.original_price - product.price) / product.original_price) * 100);
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-rose-gold">Home</Link>
            <span className="text-gray-300">/</span>
            <Link to="/products" className="text-gray-500 hover:text-rose-gold">Products</Link>
            <span className="text-gray-300">/</span>
            <span className="text-mahogany capitalize">{product.category}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    New
                  </span>
                )}
                {product.is_bestseller && (
                  <span className="bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                    Bestseller
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-rose-gold' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-rose-gold font-medium capitalize">{product.category}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-full transition-colors ${
                      isInWishlist ? 'bg-rose-gold text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleShare('native')}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-rose-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-mahogany mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 124 reviews</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-rose-gold">₹{product.price.toLocaleString()}</span>
                {product.original_price > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{product.original_price.toLocaleString()}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Save ₹{(product.original_price - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-mahogany mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-mahogany">Material:</span>
                  <span className="ml-2 text-gray-700 capitalize">{product.material}</span>
                </div>
                <div>
                  <span className="font-medium text-mahogany">Color:</span>
                  <span className="ml-2 text-gray-700 capitalize">{product.color}</span>
                </div>
              </div>

              {product.care_instructions && (
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">Care Instructions</h3>
                  <p className="text-gray-700 text-sm">{product.care_instructions}</p>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold text-mahogany mb-3">Size</h3>
              <div className="flex gap-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-rose-gold bg-rose-gold text-white'
                        : 'border-gray-300 text-gray-700 hover:border-rose-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="font-semibold text-mahogany mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 bg-gradient-to-r from-rose-gold to-copper text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 border-2 border-rose-gold text-rose-gold py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-rose-gold" />
                  <div>
                    <p className="font-medium text-mahogany">Free Delivery</p>
                    <p className="text-sm text-gray-600">On orders above ₹1,999 • Estimated delivery: {estimatedDelivery}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-rose-gold" />
                  <div>
                    <p className="font-medium text-mahogany">Easy Returns</p>
                    <p className="text-sm text-gray-600">7-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-rose-gold" />
                  <div>
                    <p className="font-medium text-mahogany">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure transactions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div>
              <h3 className="font-semibold text-mahogany mb-3">Share this product</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-mahogany mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.is_new && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-mahogany mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-rose-gold">₹{relatedProduct.price.toLocaleString()}</span>
                      {relatedProduct.original_price > relatedProduct.price && (
                        <span className="text-sm text-gray-500 line-through">₹{relatedProduct.original_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-mahogany mb-4">Sign in required</h3>
            <p className="text-gray-600 mb-6">Please sign in to add items to your cart or wishlist.</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/auth');
                }}
                className="flex-1 bg-rose-gold text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Sign In
              </button>
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

export default ProductDetails;