import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, ShoppingBag, Award, Truck, Shield } from 'lucide-react';

const HandcraftedKurtis = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blush-pink to-rose-gold py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Handcrafted Kurtis
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
              Discover authentic handcrafted kurtis at Varsh ethnic wears - where tradition meets contemporary style
            </p>
            <Link 
              to="/products" 
              className="bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center group"
            >
              Shop Handcrafted Kurtis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* What Makes Our Kurtis Special */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-mahogany mb-4">
              What Makes Our Handcrafted Kurtis Special?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every kurti at Varsh ethnic wears is carefully handcrafted by skilled artisans using traditional techniques passed down through generations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Artisan Crafted</h3>
              <p className="text-gray-600">
                Each kurti is handcrafted by skilled artisans using traditional techniques
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Premium Fabrics</h3>
              <p className="text-gray-600">
                We use only the finest cotton, silk, and georgette fabrics
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Unique Designs</h3>
              <p className="text-gray-600">
                Every kurti features unique embroidery and design elements
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Quality Assured</h3>
              <p className="text-gray-600">
                Rigorous quality checks ensure every kurti meets our standards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kurti Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-mahogany mb-4">
              Our Handcrafted Kurti Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From casual daily wear to festive celebrations, find the perfect handcrafted kurti for every occasion at Varsh ethnic wears.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link to="/products?category=casual" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Casual Kurtis</h3>
                <p className="text-gray-600 text-center">
                  Comfortable handcrafted kurtis perfect for daily wear
                </p>
              </div>
            </Link>
            
            <Link to="/products?category=formal" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Formal Kurtis</h3>
                <p className="text-gray-600 text-center">
                  Elegant handcrafted kurtis for office and formal occasions
                </p>
              </div>
            </Link>
            
            <Link to="/products?category=party" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Party Kurtis</h3>
                <p className="text-gray-600 text-center">
                  Glamorous handcrafted kurtis for special events
                </p>
              </div>
            </Link>
            
            <Link to="/products?category=festive" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3 text-center">Festive Kurtis</h3>
                <p className="text-gray-600 text-center">
                  Traditional handcrafted kurtis for festivals and celebrations
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Varsh ethnic wears */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-mahogany mb-6">
                Why Choose Varsh ethnic wears for Handcrafted Kurtis?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                At Varsh ethnic wears, we are passionate about preserving traditional craftsmanship while creating contemporary designs that appeal to modern women. Our handcrafted kurtis are more than just clothing - they are a celebration of culture, tradition, and artistry.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-rose-gold" />
                  <span className="text-gray-700">Authentic handcrafted quality</span>
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
                  <span className="text-gray-700">Easy returns and exchanges</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-gold to-blush-pink rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
              <p className="text-lg mb-6">
                Every handcrafted kurti at Varsh ethnic wears comes with our quality guarantee. We ensure that each piece meets our high standards for craftsmanship, comfort, and style.
              </p>
              <Link 
                to="/products" 
                className="bg-white text-rose-gold px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 inline-flex items-center group"
              >
                Shop Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-gold to-blush-pink">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Discover Your Perfect Handcrafted Kurti Today
          </h2>
          <p className="text-xl text-white mb-8">
            Explore our collection of authentic handcrafted kurtis at Varsh ethnic wears and find your perfect style.
          </p>
          <Link 
            to="/products" 
            className="bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 inline-flex items-center group"
          >
            Shop Handcrafted Kurtis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HandcraftedKurtis;
