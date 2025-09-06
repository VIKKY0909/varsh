import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingBag, Truck, Shield, Award } from 'lucide-react';

const VarshEthnicWears = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blush-pink to-rose-gold py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Varsh ethnic wears
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
              Your premier destination for authentic handcrafted ethnic wear and traditional Indian clothing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-rose-gold transition-all duration-300"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-mahogany mb-6">
                Why Choose Varsh ethnic wears?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                At Varsh ethnic wears, we believe that every woman deserves to feel beautiful and confident in authentic ethnic wear. Our carefully curated collection features handcrafted kurtis, sarees, and traditional Indian clothing designed for every skin tone and occasion.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-rose-gold" />
                  <span className="text-gray-700">Premium handcrafted quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-rose-gold" />
                  <span className="text-gray-700">Designed for every skin tone</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-rose-gold" />
                  <span className="text-gray-700">Free shipping above ₹999</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-rose-gold" />
                  <span className="text-gray-700">Authentic traditional craftsmanship</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-mahogany mb-4">Our Collections</h3>
              <div className="space-y-4">
                <Link to="/products?category=casual" className="block p-4 bg-gray-50 rounded-lg hover:bg-rose-gold hover:text-white transition-colors">
                  <h4 className="font-semibold">Casual Wear</h4>
                  <p className="text-sm">Comfortable daily wear kurtis</p>
                </Link>
                <Link to="/products?category=formal" className="block p-4 bg-gray-50 rounded-lg hover:bg-rose-gold hover:text-white transition-colors">
                  <h4 className="font-semibold">Formal Wear</h4>
                  <p className="text-sm">Professional office attire</p>
                </Link>
                <Link to="/products?category=party" className="block p-4 bg-gray-50 rounded-lg hover:bg-rose-gold hover:text-white transition-colors">
                  <h4 className="font-semibold">Party Wear</h4>
                  <p className="text-sm">Elegant evening wear</p>
                </Link>
                <Link to="/products?category=festive" className="block p-4 bg-gray-50 rounded-lg hover:bg-rose-gold hover:text-white transition-colors">
                  <h4 className="font-semibold">Festive Wear</h4>
                  <p className="text-sm">Traditional celebration attire</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-mahogany mb-4">
              What Makes Varsh ethnic wears Special?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to providing you with the finest ethnic wear that combines traditional craftsmanship with contemporary style.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Premium Quality</h3>
              <p className="text-gray-600">
                Every piece at Varsh ethnic wears is carefully selected for its superior quality and authentic craftsmanship.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Inclusive Design</h3>
              <p className="text-gray-600">
                Our ethnic wear is designed to flatter every skin tone and body type, celebrating diversity and beauty.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Easy Shopping</h3>
              <p className="text-gray-600">
                Enjoy a seamless shopping experience with secure payments, easy returns, and fast delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-gold to-blush-pink">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Discover Varsh ethnic wears?
          </h2>
          <p className="text-xl text-white mb-8">
            Explore our collection of handcrafted ethnic wear and find your perfect style today.
          </p>
          <Link 
            to="/products" 
            className="bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center group"
          >
            Shop Collection
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default VarshEthnicWears;
