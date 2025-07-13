import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Casual Kurtis",
      description: "Comfortable everyday wear",
      image: "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&w=600",
      path: "/products?category=casual",
      count: "50+ Designs"
    },
    {
      id: 2,
      name: "Formal Kurtis",
      description: "Professional and elegant",
      image: "https://images.pexels.com/photos/7148971/pexels-photo-7148971.jpeg?auto=compress&cs=tinysrgb&w=600",
      path: "/products?category=formal",
      count: "35+ Designs"
    },
    {
      id: 3,
      name: "Party Wear",
      description: "Glamorous evening styles",
      image: "https://images.pexels.com/photos/6146969/pexels-photo-6146969.jpeg?auto=compress&cs=tinysrgb&w=600",
      path: "/products?category=party",
      count: "40+ Designs"
    },
    {
      id: 4,
      name: "Festive Collection",
      description: "Traditional celebration wear",
      image: "https://images.pexels.com/photos/8939575/pexels-photo-8939575.jpeg?auto=compress&cs=tinysrgb&w=600",
      path: "/products?category=festive",
      count: "60+ Designs"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-rose-50 px-4 sm:px-6 py-2 rounded-full text-rose-gold font-medium mb-4 text-sm sm:text-base">
            Shop by Category
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mahogany mb-4 sm:mb-6">
            Find Your Perfect <span className="text-rose-gold">Kurti</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our diverse collection designed for every occasion and style preference
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-mahogany">
                  {category.count}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 group-hover:text-blush-pink transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm sm:text-base opacity-90 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center text-sm font-medium group-hover:text-blush-pink transition-colors">
                  Explore Collection
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center bg-white border-2 border-rose-gold text-rose-gold px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 shadow-lg"
          >
            View All Kurtis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;