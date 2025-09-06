import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingBag } from 'lucide-react';

const EthnicWearCollection = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-gold to-blush-pink py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Ethnic Wear Collection
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
              Discover our curated collection of authentic ethnic wear at Varsh ethnic wears
            </p>
            <Link 
              to="/products" 
              className="bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center group"
            >
              Explore Collection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Collection Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-mahogany mb-4">
              Our Ethnic Wear Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From casual daily wear to festive celebrations, find the perfect ethnic wear for every occasion at Varsh ethnic wears.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/products?category=casual" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Casual Wear</h3>
                <p className="text-gray-600 text-center">
                  Comfortable daily wear kurtis perfect for everyday elegance
                </p>
              </div>
            </Link>
            
            <Link to="/products?category=formal" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Formal Wear</h3>
                <p className="text-gray-600 text-center">
                  Professional office attire with traditional charm
                </p>
              </div>
            </Link>
            
            <Link to="/products?category=party" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Party Wear</h3>
                <p className="text-gray-600 text-center">
                  Elegant evening wear for special occasions
                </p>
              </div>
            </Link>
            
            <Link to="/products?category=festive" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Festive Wear</h3>
                <p className="text-gray-600 text-center">
                  Traditional celebration attire for festivals
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-mahogany mb-4">
              Why Choose Varsh ethnic wears for Your Ethnic Wear Collection?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are committed to providing you with the finest ethnic wear that celebrates tradition while embracing contemporary style.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Authentic Craftsmanship</h3>
              <p className="text-gray-600">
                Every piece in our ethnic wear collection is handcrafted by skilled artisans using traditional techniques.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Inclusive Sizing</h3>
              <p className="text-gray-600">
                Our ethnic wear collection is designed to flatter every body type and skin tone.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                We ensure every piece meets our high standards for quality and authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-gold to-blush-pink">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Building Your Ethnic Wear Collection Today
          </h2>
          <p className="text-xl text-white mb-8">
            Explore our curated collection of authentic ethnic wear at Varsh ethnic wears and find your perfect style.
          </p>
          <Link 
            to="/products" 
            className="bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center group"
          >
            Shop Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EthnicWearCollection;
