import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B76E79' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm15-15c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-left order-2 lg:order-1">
            <div className="inline-flex items-center bg-gradient-to-r from-blush-pink to-rose-gold text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Premium Quality Kurtis
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-mahogany leading-tight mb-6">
              Elegant
              <span className="block text-rose-gold">Kurtis</span>
              <span className="block">for Every</span>
              <span className="block">Occasion</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Discover our handcrafted collection of premium kurtis that blend traditional artistry with contemporary style. Perfect for every modern woman.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                to="/products"
                className="bg-rose-gold text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group"
              >
                Shop Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/about"
                className="border-2 border-rose-gold text-rose-gold px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 text-center"
              >
                Our Story
              </Link>
            </div>
            
            {/* Stats */}
            {/* <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-mahogany">5k+</div>
                <div className="text-xs sm:text-sm text-gray-500">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-mahogany">200+</div>
                <div className="text-xs sm:text-sm text-gray-500">Unique Designs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-mahogany">4.8★</div>
                <div className="text-xs sm:text-sm text-gray-500">Customer Rating</div>
              </div>
            </div> */}
          </div>

          {/* Right Content - Image */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-pink to-rose-gold rounded-3xl transform rotate-6 opacity-20"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Beautiful kurti collection"
                className="w-full h-80 sm:h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 bg-white bg-opacity-95 backdrop-blur rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-mahogany mb-1 text-sm sm:text-base">Featured: Cotton Silk Collection</h3>
                <p className="text-xs sm:text-sm text-gray-600">Handcrafted kurtis with intricate embroidery</p>
                <div className="flex items-center justify-between mt-2 sm:mt-3">
                  <span className="text-rose-gold font-bold text-sm sm:text-base">From ₹1,299</span>
                  <Link to="/products" className="text-xs sm:text-sm text-rose-gold hover:text-mahogany transition-colors">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;