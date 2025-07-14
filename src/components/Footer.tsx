import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    'About Us', 'Size Guide', 'Shipping Info', 'Returns & Exchange', 
    'Care Instructions', 'Bulk Orders', 'Store Locator', 'Gift Cards'
  ];

  const categories = [
    'Sarees', 'Lehengas', 'Anarkalis', 'Kurtis', 
    'Sharara Sets', 'Palazzo Sets', 'Bridal Wear', 'Accessories'
  ];

  return (
    <footer className="bg-mahogany text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-rose-gold to-copper py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Stay Updated with Latest Collections
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter and get exclusive access to new arrivals and special offers
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl text-mahogany placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-mahogany text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-300 whitespace-nowrap">
              Subscribe
            </button>
          </div>
          
          <p className="text-sm mt-4 opacity-75">
            Join 50,000+ fashion enthusiasts who trust Varsh Ethnic Wears
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Brand Info */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-6 text-blush-pink">
                Varsh Ethnic Wears
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Celebrating the beauty of traditional Indian ethnic wear with contemporary elegance. Each piece is crafted with love and attention to detail.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-rose-gold" />
                  <span className="text-gray-300">varshethnicwears@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-rose-gold" />
                  <span className="text-gray-300">varshethnicwears@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-rose-gold" />
                  <span className="text-gray-300">Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-rose-gold">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-300 hover:text-blush-pink transition-colors duration-300">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-rose-gold">Categories</h4>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category}>
                    <a href="#" className="text-gray-300 hover:text-blush-pink transition-colors duration-300">
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social & Customer Service */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-rose-gold">Connect With Us</h4>
              
              <div className="flex gap-4 mb-8">
                <a href="#" className="bg-rose-gold p-3 rounded-full hover:bg-copper transition-all duration-300 transform hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-rose-gold p-3 rounded-full hover:bg-copper transition-all duration-300 transform hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="bg-rose-gold p-3 rounded-full hover:bg-copper transition-all duration-300 transform hover:scale-110">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-rose-gold p-3 rounded-full hover:bg-copper transition-all duration-300 transform hover:scale-110">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-blush-pink mb-2">Customer Service</h5>
                  <p className="text-sm text-gray-300">Mon - Sat: 10:00 AM - 7:00 PM</p>
                  <p className="text-sm text-gray-300">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
                
                <div>
                  <h5 className="font-semibold text-blush-pink mb-2">Secure Payments</h5>
                  <p className="text-sm text-gray-300">We accept all major credit cards, UPI, and digital wallets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-rose-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 Varsh Ethnic Wears. All rights reserved. Crafted with love in India.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blush-pink transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blush-pink transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-blush-pink transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;