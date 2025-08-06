import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User, Heart, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    if (!isUserMenuOpen) return;
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin
  const isAdmin = user?.email === 'vikivahane@gmail.com';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-rose-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-gold to-mahogany text-white text-center py-2 px-4 text-xs sm:text-sm">
        <span className="hidden sm:inline">🚚 Free shipping on orders above ₹999 | ✨ Authentic handcrafted ethnic wear</span>
        <span className="sm:hidden">🚚 Free shipping above ₹999</span>
      </div>
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 relative">
          {/* Logo/Brand */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-mahogany tracking-wide group-hover:text-rose-gold transition-colors duration-200">
                Varsh <span className="text-rose-gold">Ethnic Wears</span>
              </h1>
              {/* <span className="text-xs sm:text-sm text-gray-500 hidden sm:block tracking-wider">Handcrafted with ❤️</span> */}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 mx-auto ml-8 xl:ml-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-2 font-semibold text-sm xl:text-base rounded-lg transition-all duration-200 group ${
                  isActive(link.path)
                    ? 'text-white bg-rose-gold shadow-md'
                    : 'text-mahogany hover:text-rose-gold hover:bg-rose-50'
                }`}
                tabIndex={0}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                <span>{link.name}</span>
                {!isActive(link.path) && (
                  <span className="absolute inset-0 rounded-lg border-2 border-rose-gold opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                )}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-9 lg:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent text-sm lg:text-base transition-all duration-300 ${searchFocused ? 'shadow-lg ring-2 ring-rose-gold' : ''}`}
                aria-label="Search products"
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <button
              className="md:hidden p-2 hover:bg-rose-50 rounded-xl transition-all duration-200 hover:scale-105"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany hover:text-rose-gold transition-colors" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 hover:bg-rose-50 rounded-xl transition-all duration-200 group hover:scale-105"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany group-hover:text-rose-gold transition-colors" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-rose-50 rounded-xl transition-all duration-200 group hover:scale-105"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany group-hover:text-rose-gold transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-gold to-mahogany text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Profile/User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="p-2 hover:bg-rose-50 rounded-xl transition-all duration-200 group hover:scale-105"
                  aria-label="Account menu"
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany group-hover:text-rose-gold transition-colors" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fade-in">
                    <div className="px-3 sm:px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 bg-rose-gold rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-mahogany truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-mahogany hover:bg-rose-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-mahogany hover:bg-rose-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-mahogany hover:bg-rose-50 transition-colors flex items-center gap-2"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-mahogany hover:bg-rose-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="p-1.5 sm:p-2 hover:bg-rose-50 rounded-full transition-colors group"
                aria-label="Sign in"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany group-hover:text-rose-gold transition-colors" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-mahogany hover:text-rose-gold hover:bg-rose-50 rounded-xl transition-all duration-200 ml-1 hover:scale-105"
              aria-label="Open menu"
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 sm:pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent text-sm sm:text-base"
              aria-label="Search products"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40 animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-rose-100 z-50 animate-slide-down rounded-b-3xl mx-2 sm:mx-4">
              <nav className="px-4 py-6 space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-mahogany">Navigate</h3>
                  <p className="text-sm text-gray-500">Explore our collection</p>
                </div>
                {NAV_LINKS.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center justify-between w-full px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
                      isActive(link.path) 
                        ? 'bg-gradient-to-r from-rose-gold to-mahogany text-white shadow-lg' 
                        : 'text-mahogany hover:bg-rose-50 hover:text-rose-gold border border-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{link.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActive(link.path) ? 'bg-white/20' : 'bg-rose-gold/10 text-rose-gold'
                    }`}>
                      {index === 1 ? '🛍️' : index === 0 ? '🏠' : index === 2 ? '👥' : '📞'}
                    </span>
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <p className="text-xs text-gray-500 text-center">Handcrafted with ❤️ by Varsh Team</p>
                </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
