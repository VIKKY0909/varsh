import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User, Heart, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur shadow-md border-b border-rose-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 text-center py-2 px-4 text-xs sm:text-sm text-mahogany">
        <span className="hidden sm:inline">Free shipping on orders above 999 | Authentic handcrafted ethnic wear</span>
        <span className="sm:hidden">Free shipping above ₹999</span>
      </div>
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 relative">
          {/* Logo/Brand */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-mahogany tracking-wide">
              <span className="hidden sm:inline">Varsh </span>
              <span className="text-rose-gold">
                <span className="sm:hidden">VEW</span>
                <span className="hidden sm:inline">Ethnic Wears</span>
              </span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-2 py-1 font-semibold text-base xl:text-lg transition-colors duration-200 group ${
                  isActive(link.path)
                    ? 'text-rose-gold'
                    : 'text-mahogany hover:text-rose-gold'
                }`}
                tabIndex={0}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                <span>{link.name}</span>
                <span
                  className={`absolute left-0 -bottom-1 w-full h-0.5 rounded bg-rose-gold transition-all duration-300 ${
                    isActive(link.path) ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                  }`}
                />
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
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Mobile Search */}
            <button
              className="md:hidden p-1.5 sm:p-2 hover:bg-rose-50 rounded-full transition-colors"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany hover:text-rose-gold transition-colors" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-1.5 sm:p-2 hover:bg-rose-50 rounded-full transition-colors group"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany group-hover:text-rose-gold transition-colors" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-1.5 sm:p-2 hover:bg-rose-50 rounded-full transition-colors group"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-mahogany group-hover:text-rose-gold transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-rose-gold text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium animate-bounce">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Profile/User */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  className="p-1.5 sm:p-2 hover:bg-rose-50 rounded-full transition-colors group"
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
              className="lg:hidden p-1.5 sm:p-2 text-mahogany hover:text-rose-gold transition-colors ml-1"
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
              className="fixed inset-0 bg-black bg-opacity-30 z-40 animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-rose-100 z-50 animate-slide-down rounded-b-2xl mx-4 sm:mx-0">
              <nav className="px-4 py-4 sm:py-6 space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto flex flex-col items-center">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block w-full text-center py-2.5 sm:py-3 text-base sm:text-lg font-semibold rounded-lg transition-colors duration-200 ${
                      isActive(link.path) ? 'bg-rose-gold text-white' : 'text-mahogany hover:bg-rose-gold hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
