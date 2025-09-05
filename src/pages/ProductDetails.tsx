import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Share2, Truck, Shield, ChevronLeft, ChevronRight, Plus, Minus, Facebook, Twitter, Instagram, ZoomIn, ZoomOut, X } from 'lucide-react';
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
  has_delivery_charge: boolean;
  delivery_charge: number;
  free_delivery_threshold: number;
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
  
  // Image gallery states
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  
  const { addToCart, items, checkStockAvailability } = useCart();
  const { user } = useAuth();

  // Check if product is already in cart
  const isProductInCart = () => {
    if (!product || !selectedSize) return false;
    return items.some(item => item.product_id === product.id && item.size === selectedSize);
  };

  // Get current quantity in cart
  const getCurrentCartQuantity = () => {
    if (!product || !selectedSize) return 0;
    const cartItem = items.find(item => item.product_id === product.id && item.size === selectedSize);
    return cartItem ? cartItem.quantity : 0;
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      checkWishlistStatus();
    }
  }, [id, user]);

  // Preload all product images when product is loaded
  useEffect(() => {
    if (product && product.images.length > 0) {
      preloadImages();
    }
  }, [product]);

  const preloadImages = () => {
    if (!product) return;
    
    product.images.forEach((imageUrl, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
      img.onerror = () => {
        console.warn(`Failed to load image ${index}:`, imageUrl);
      };
      img.src = imageUrl;
    });
  };

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
      setSelectedImage(0);
      setImageLoading(false);
      setLoadedImages(new Set());
      
      // Fetch related products
      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);
      
      setRelatedProducts(related || []);
    } catch (error) {
      // Handle error silently
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
      // Handle error silently
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
    if (!product) return;

    try {
      // Check if product is already in cart
      const existingCartItem = items.find(
        item => item.product_id === product.id && item.size === selectedSize
      );

      if (existingCartItem) {
        // Product is already in cart, check if we can add more
        const currentQuantity = existingCartItem.quantity;
        const newQuantity = currentQuantity + quantity;
        
        // Check if we have enough stock for the new quantity
        const isAvailable = await checkStockAvailability(product.id, selectedSize, newQuantity);
        
        if (isAvailable) {
          await addToCart(product.id, selectedSize, quantity);
          await fetchProduct();
          alert(`Added ${quantity} more to cart! Total quantity: ${newQuantity}`);
        } else {
          alert(`Cannot add more. Only ${product.stock_quantity} items available in stock.`);
        }
      } else {
        // Product not in cart, add it
        await addToCart(product.id, selectedSize, quantity);
        await fetchProduct();
        alert('Added to cart successfully!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
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
    if (!product) return;

    try {
      // Check if product is already in cart
      const existingCartItem = items.find(
        item => item.product_id === product.id && item.size === selectedSize
      );

      if (existingCartItem) {
        // Product is already in cart, check if we can add one more
        const currentQuantity = existingCartItem.quantity;
        const newQuantity = currentQuantity + quantity;
        
        // Check if we have enough stock for the new quantity
        const isAvailable = await checkStockAvailability(product.id, selectedSize, newQuantity);
        
        if (isAvailable) {
          // Add one more to cart
          await addToCart(product.id, selectedSize, quantity);
          await fetchProduct();
        }
        // If not available, just proceed to checkout with current cart
      } else {
        // Product not in cart, add it
        await addToCart(product.id, selectedSize, quantity);
        await fetchProduct();
      }
      
      // Navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error in Buy Now:', error);
      // If there's an error adding to cart, still navigate to checkout
      // so user can see what's in their cart
      navigate('/checkout');
    }
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
      // Handle error silently
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

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setZoomLevel(1);
  };

  const nextImage = () => {
    if (product) {
      setModalImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setModalImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleImageChange = (newIndex: number) => {
    if (newIndex === selectedImage) return;
    
    setImageLoading(true);
    setSelectedImage(newIndex);
    
    // If image is already loaded, stop loading immediately
    if (loadedImages.has(newIndex)) {
      setImageLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.5);
    } else if (direction === 'out' && zoomLevel > 1) {
      setZoomLevel(zoomLevel - 0.5);
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
  const estimatedDelivery = 'Expected delivery: 13-14 days';

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
          {/* Product Images Gallery */}
          <div className="space-y-6">
            {/* Main Image with Zoom */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <div 
                className="relative overflow-hidden cursor-zoom-in"
                onClick={() => openImageModal(selectedImage)}
              >
                {/* Loading Overlay */}
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-gold mx-auto mb-4"></div>
                      <p className="text-mahogany font-medium">Loading image...</p>
                    </div>
                  </div>
                )}
                
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={`w-full h-96 lg:h-[500px] object-cover transition-all duration-300 hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom('out');
                    }}
                    className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom('in');
                    }}
                    className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIndex = selectedImage > 0 ? selectedImage - 1 : product.images.length - 1;
                        handleImageChange(newIndex);
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all disabled:opacity-50"
                      disabled={imageLoading}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newIndex = selectedImage < product.images.length - 1 ? selectedImage + 1 : 0;
                        handleImageChange(newIndex);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all disabled:opacity-50"
                      disabled={imageLoading}
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

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    disabled={imageLoading}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative ${
                      selectedImage === index ? 'border-rose-gold scale-105' : 'border-gray-200 hover:border-rose-gold'
                    } ${imageLoading ? 'opacity-50' : ''}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    {/* Loading indicator for thumbnails */}
                    {!loadedImages.has(index) && (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-gold"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Image Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => openImageModal(selectedImage)}
                className="flex items-center gap-2 text-rose-gold hover:text-rose-800 font-medium"
              >
                <ZoomIn className="w-4 h-4" />
                View All Images
              </button>
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                <span>360° View</span>
              </div> */}
            </div>
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
              
{/*               <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) • 124 reviews</span>
              </div> */}

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
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </div>
                  {isProductInCart() && (
                    <div className="text-green-600 font-medium">
                      ✓ {getCurrentCartQuantity()} in your cart
                    </div>
                  )}
                </div>
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
                  {isProductInCart() ? 'Buy Now (Add +1)' : 'Buy Now'}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1 border-2 border-rose-gold text-rose-gold py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isProductInCart() ? `Add More (${getCurrentCartQuantity()} in cart)` : 'Add to Cart'}
                </button>
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-rose-gold" />
                  <div>
                    <p className="font-medium text-mahogany">
                      {product.has_delivery_charge ? 'Delivery Charges' : 'Free Delivery'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.has_delivery_charge ? (
                        <>
                          ₹{product.delivery_charge} delivery charge • Free above ₹{product.free_delivery_threshold} • {estimatedDelivery}
                        </>
                      ) : (
                        `Free delivery • ${estimatedDelivery}`
                      )}
                    </p>
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

      {/* Image Modal */}
      {showImageModal && product && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative">
              <img
                src={product.images[modalImageIndex]}
                alt={product.name}
                className="max-w-full max-h-[80vh] object-contain"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              
              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={() => handleZoom('out')}
                  className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('in')}
                  className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                  {modalImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`w-16 h-16 rounded border-2 transition-all ${
                      modalImageIndex === index ? 'border-rose-gold' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
