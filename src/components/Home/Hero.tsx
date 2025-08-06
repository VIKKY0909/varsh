import React from 'react';
import { ArrowRight } from 'lucide-react';
import heroImg from "../../lib/5dec5227-cf34-4607-a33e-21c33efd7203_20250725_014719_0000.jpg";
import { useNavigate } from 'react-router-dom';

const Hero = () => {
const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B76E79' fill-opacity='0.4'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm15-15c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Order 2 on mobile, 1 on desktop */}
          <div className="text-left order-2 lg:order-1">
            <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ New Collection Arrived
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-mahogany leading-tight mb-6">
              Timeless
              <span className="block text-rose-gold">Ethnic</span>
              <span className="block">Elegance</span>
            </h1>
            
            <h2 className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Discover handcrafted ethnic wear that celebrates tradition while embracing contemporary style. Each piece tells a story of heritage and artistry.
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/products')} className="bg-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center group">
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button onClick={() => navigate('/about')} className="border-2 border-rose-gold text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300">
                Watch Our Story
              </button>
            </div>
            
            {/* Stats */}
{/*             <div className="flex gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-mahogany">10k+</div>
                <div className="text-sm text-gray-500">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-mahogany">500+</div>
                <div className="text-sm text-gray-500">Unique Designs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-mahogany">25+</div>
                <div className="text-sm text-gray-500">Years of Craftsmanship</div>
              </div>
            </div> */}
          </div>

          {/* Right Content - Image - Order 1 on mobile, 2 on desktop */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blush-pink to-rose-gold rounded-3xl transform rotate-6 opacity-20"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              <img
                src= {heroImg}
                alt="Beautiful ethnic wear model"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white bg-opacity-95 backdrop-blur rounded-xl p-4">
                <h3 className="font-semibold text-mahogany mb-1">Featured: IndiRatri</h3>
                <p className="text-sm text-gray-600">Infuse elegance into your everyday wardrobe with our IndiRatri Cotton Kurti</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-rose-gold font-bold">From 449</span>
                  <button onClick={() => navigate('/products')} className="text-sm text-rose-gold hover:text-mahogany transition-colors">
                    View Details →
                  </button>
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
