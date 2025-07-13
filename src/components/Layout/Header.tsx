import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User, Heart, LogOut, Home, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { name: 'All Kurtis', path: '/products' },
    { name: 'Casual Kurtis', path: '/products?category=casual' },
    { name: 'Formal Kurtis', path: '/products?category=formal' },
    { name: 'Party Wear', path: '/products?category=party' },
    { name: 'Festive Collection', path: '/products?category=festive' },
    { name: 'Cotton Kurtis', path: '/products?material=cotton' },
    { name: 'Silk Kurtis', path: '/products?material=silk' }
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Check if user is admin
  const isAdmin = user?.email === 'vikivahane@gmail.com';

  return (
    <header className="relative bg-white shadow-sm border-b border-rose-100 sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 text-center py-2 text-sm text-mahogany">
        Free shipping on orders above ₹1,999 | Authentic handcrafted kurtis
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-mahogany tracking-wide">
              Varsh <span className="text-rose-gold font-light">Kurtis</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              to="/"
              className={`flex items-center gap-2 transition-colors duration-300 font-medium text-sm xl:text-base ${
                isActive('/') ? 'text-rose-gold' : 'text-mahogany hover:text-rose-gold'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className={`transition-colors duration-300 font-medium text-sm xl:text-base whitespace-nowrap ${
                  isActive(category.path) ? 'text-rose-gold' : 'text-mahogany hover:text-rose-gold'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search kurtis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent text-sm"
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mobile Search */}
            <button className="md:hidden p-2 hover:bg-rose-50 rounded-full transition-colors">
              <Search className="w-5 h-5 text-mahogany hover:text-rose-gold transition-colors" />
            </button>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-mahogany hover:text-rose-gold transition-colors" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-mahogany truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-mahogany hover:bg-rose-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-mahogany hover:bg-rose-50 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-mahogany hover:bg-rose-50 transition-colors flex items-center gap-2"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-mahogany hover:bg-rose-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="p-2 hover:bg-rose-50 rounded-full transition-colors">
                <User className="w-5 h-5 text-mahogany hover:text-rose-gold transition-colors" />
              </Link>
            )}
            
            <Link to="/wishlist" className="p-2 hover:bg-rose-50 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-mahogany hover:text-rose-gold transition-colors" />
            </Link>
            
            <Link to="/cart" className="relative p-2 hover:bg-rose-50 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 text-mahogany hover:text-rose-gold transition-colors" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-mahogany hover:text-rose-gold transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search kurtis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent text-sm"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-rose-100 z-50">
            <nav className="px-4 py-4 space-y-3 max-h-96 overflow-y-auto">
              <Link
                to="/"
                className={`flex items-center gap-2 py-2 transition-colors duration-300 font-medium border-b border-gray-100 ${
                  isActive('/') ? 'text-rose-gold' : 'text-mahogany hover:text-rose-gold'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className={`block py-2 transition-colors duration-300 font-medium border-b border-gray-100 last:border-b-0 ${
                    isActive(category.path) ? 'text-rose-gold' : 'text-mahogany hover:text-rose-gold'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;