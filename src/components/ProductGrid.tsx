import React, { useState } from 'react';
import { Search, Filter, Heart, ShoppingBag, Zap } from 'lucide-react';

const ProductGrid = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Sarees', 'Lehengas', 'Kurtis', 'Anarkalis', 'Sets'];

  const products = [
    {
      id: 1,
      name: "Royal Banarasi Silk Saree",
      category: "Sarees",
      price: "₹18,999",
      originalPrice: "₹24,999",
      image: "https://images.pexels.com/photos/8939575/pexels-photo-8939575.jpeg?auto=compress&cs=tinysrgb&w=800",
      isNew: true,
      isBestseller: false
    },
    {
      id: 2,
      name: "Embroidered Silk Lehenga",
      category: "Lehengas",
      price: "₹42,999",
      originalPrice: "₹55,999",
      image: "https://images.pexels.com/photos/6146964/pexels-photo-6146964.jpeg?auto=compress&cs=tinysrgb&w=800",
      isNew: false,
      isBestseller: true
    },
    {
      id: 3,
      name: "Designer Anarkali Dress",
      category: "Anarkalis",
      price: "₹12,999",
      originalPrice: "₹17,999",
      image: "https://images.pexels.com/photos/7148971/pexels-photo-7148971.jpeg?auto=compress&cs=tinysrgb&w=800",
      isNew: false,
      isBestseller: false
    },
    {
      id: 4,
      name: "Cotton Silk Kurti Set",
      category: "Kurtis",
      price: "₹3,999",
      originalPrice: "₹5,999",
      image: "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&w=800",
      isNew: true,
      isBestseller: false
    },
    {
      id: 5,
      name: "Festive Sharara Set",
      category: "Sets",
      price: "₹8,999",
      originalPrice: "₹12,999",
      image: "https://images.pexels.com/photos/7148970/pexels-photo-7148970.jpeg?auto=compress&cs=tinysrgb&w=800",
      isNew: false,
      isBestseller: true
    },
    {
      id: 6,
      name: "Handwoven Chanderi Saree",
      category: "Sarees",
      price: "₹9,999",
      originalPrice: "₹13,999",
      image: "https://images.pexels.com/photos/8939574/pexels-photo-8939574.jpeg?auto=compress&cs=tinysrgb&w=800",
      isNew: true,
      isBestseller: false
    }
  ];

  const filteredProducts = activeFilter === 'All' 
    ? products 
    : products.filter(product => product.category === activeFilter);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-mahogany mb-6">
            Shop Our <span className="text-rose-gold">Collection</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through our carefully curated selection of premium ethnic wear
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-rose-gold text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-rose-100 hover:text-rose-gold'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Filter Icon */}
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl hover:bg-rose-100 hover:text-rose-gold transition-all duration-300">
            <Filter className="w-5 h-5" />
            <span className="font-medium">More Filters</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      New
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="bg-rose-gold text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="bg-white bg-opacity-90 backdrop-blur p-2 rounded-full hover:bg-rose-gold hover:text-white transition-all duration-300">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="bg-white bg-opacity-90 backdrop-blur p-2 rounded-full hover:bg-rose-gold hover:text-white transition-all duration-300">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <button className="bg-white text-mahogany px-6 py-2 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300">
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-rose-gold font-medium">{product.category}</span>
                  <div className="text-sm text-gray-500">
                    Save {Math.round(((parseInt(product.originalPrice.replace(/[^\d]/g, '')) - parseInt(product.price.replace(/[^\d]/g, ''))) / parseInt(product.originalPrice.replace(/[^\d]/g, ''))) * 100)}%
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-mahogany mb-3 group-hover:text-rose-gold transition-colors">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-rose-gold">{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-gradient-to-r from-rose-gold to-copper text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-rose-gold text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 shadow-lg">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;