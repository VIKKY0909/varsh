import React from 'react';
import { Star, Heart } from 'lucide-react';

const FeaturedCollections = () => {
  const collections = [
    {
      id: 1,
      title: "Bridal Lehengas",
      description: "Exquisite handcrafted lehengas for your special day",
      image: "https://images.pexels.com/photos/6146967/pexels-photo-6146967.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "₹35,999",
      originalPrice: "₹45,999",
      rating: 4.9,
      reviews: 124
    },
    {
      id: 2,
      title: "Designer Sarees",
      description: "Contemporary sarees with traditional artistry",
      image: "https://images.pexels.com/photos/8939563/pexels-photo-8939563.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "₹12,999",
      originalPrice: "₹16,999",
      rating: 4.8,
      reviews: 89
    },
    {
      id: 3,
      title: "Anarkali Sets",
      description: "Flowing silhouettes with intricate embroidery",
      image: "https://images.pexels.com/photos/6146969/pexels-photo-6146969.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "₹8,999",
      originalPrice: "₹12,999",
      rating: 4.7,
      reviews: 67
    },
    {
      id: 4,
      title: "Sharara Collections",
      description: "Modern sharara sets for festive occasions",
      image: "https://images.pexels.com/photos/7148972/pexels-photo-7148972.jpeg?auto=compress&cs=tinysrgb&w=800",
      price: "₹6,999",
      originalPrice: "₹9,999",
      rating: 4.6,
      reviews: 92
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-white px-6 py-2 rounded-full text-rose-gold font-medium mb-4 shadow-sm">
            Curated Collections
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-mahogany mb-6">
            Featured <span className="text-rose-gold">Collections</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our handpicked selection of premium ethnic wear, crafted with attention to detail and timeless elegance
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4">
                  <button className="bg-white bg-opacity-90 backdrop-blur p-2 rounded-full hover:bg-rose-gold hover:text-white transition-all duration-300">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                  New
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-mahogany mb-2 group-hover:text-rose-gold transition-colors">
                  {collection.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {collection.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-mahogany ml-1">
                      {collection.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({collection.reviews} reviews)
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-rose-gold">
                      {collection.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {collection.originalPrice}
                    </span>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                    Save 22%
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-rose-gold to-copper text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  View Collection
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-rose-gold text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 shadow-lg">
            View All Collections
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;