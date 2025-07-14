import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Size Guide', path: '/size-guide' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/faq' }
  ];

  const categories = [
    { name: 'Casual Wear', path: '/products?category=casual' },
    { name: 'Formal Wear', path: '/products?category=formal' },
    { name: 'Party Wear', path: '/products?category=party' },
    { name: 'Festive Collection', path: '/products?category=festive' },
  ];

  return (
    <footer className="bg-mahogany text-white">
      
      {/* Main Footer */}
      <div className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Info */}
            <div className="lg:col-span-1">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blush-pink">
                Varsh Ethnic Wears
              </h3>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Celebrating the beauty of traditional Indian ethnic wear with contemporary elegance. Each piece is crafted with love and attention to detail.
              </p>
              
              <div className="space-y-3">
              
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-rose-gold flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base break-all">varshethnicwears@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-rose-gold flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">Ahmedabad, Gujarat, India</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 sm:mb-6 text-rose-gold">Quick Links</h4>
              <ul className="space-y-2 sm:space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-300 hover:text-blush-pink transition-colors duration-300 text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4 sm:mb-6 text-rose-gold">Categories</h4>
              <ul className="space-y-2 sm:space-y-3">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link 
                      to={category.path} 
                      className="text-gray-300 hover:text-blush-pink transition-colors duration-300 text-sm sm:text-base"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-4 sm:mb-6 text-rose-gold">Connect With Us</h4>
              
              <div className="flex gap-3 sm:gap-4 mb-6 sm:mb-8">
                
                <a href="#" className="bg-rose-gold p-2 sm:p-3 rounded-full hover:bg-copper transition-all duration-300 transform hover:scale-110">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                
                <a href="#" className="bg-rose-gold p-2 sm:p-3 rounded-full hover:bg-copper transition-all duration-300 transform hover:scale-110">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>

              <div className="space-y-4">
                
                <div>
                  <h5 className="font-semibold text-blush-pink mb-2 text-sm sm:text-base">Secure Payments</h5>
                  <p className="text-xs sm:text-sm text-gray-300">We accept all major credit cards, UPI, and digital wallets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-rose-900 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2024 Varsh Ethnic Wears. All rights reserved. Crafted with love in India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-blush-pink transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-blush-pink transition-colors">Terms of Service</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-blush-pink transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;