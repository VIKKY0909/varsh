import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Search, User, Heart } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    'Sarees',
    'Lehengas',
    'Anarkalis',
    'Kurtis',
    'Sharara Sets',
    'Palazzo Sets',
    'Bridal Wear'
  ];

  return (
    <header className="relative bg-white shadow-sm border-b border-rose-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 text-center py-2 text-sm text-mahogany">
        Free shipping on orders above ₹2,999 | Authentic handcrafted ethnic wear
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-mahogany tracking-wide">
              Varsh <span className="text-rose-gold font-light">Ethnic Wears</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <a
                key={category}
                href="#"
                className="text-mahogany hover:text-rose-gold transition-colors duration-300 font-medium"
              >
                {category}
              </a>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-mahogany hover:text-rose-gold cursor-pointer transition-colors" />
            <User className="w-5 h-5 text-mahogany hover:text-rose-gold cursor-pointer transition-colors" />
            <Heart className="w-5 h-5 text-mahogany hover:text-rose-gold cursor-pointer transition-colors" />
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-mahogany hover:text-rose-gold cursor-pointer transition-colors" />
              <span className="absolute -top-2 -right-2 bg-rose-gold text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-mahogany hover:text-rose-gold"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-rose-100 z-50">
            <nav className="px-4 py-4 space-y-3">
              {categories.map((category) => (
                <a
                  key={category}
                  href="#"
                  className="block text-mahogany hover:text-rose-gold transition-colors duration-300 font-medium py-2"
                >
                  {category}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;