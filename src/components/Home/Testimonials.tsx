import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      comment: "Absolutely love the quality and fit of Varsh kurtis! The fabric is so comfortable and the designs are unique. I've ordered 5 kurtis so far and each one exceeded my expectations.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 2,
      name: "Anita Patel",
      location: "Delhi",
      rating: 5,
      comment: "The attention to detail is remarkable. I wore their festive kurti to a wedding and received so many compliments. The embroidery work is exquisite and the colors are vibrant.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 3,
      name: "Meera Reddy",
      location: "Bangalore",
      rating: 5,
      comment: "Perfect for office wear! The formal kurtis are elegant yet comfortable. The sizing is accurate and the delivery was super fast. Highly recommend Varsh Kurtis!",
      image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 4,
      name: "Kavya Singh",
      location: "Pune",
      rating: 5,
      comment: "Amazing collection! I love how they blend traditional designs with modern cuts. The cotton kurtis are perfect for daily wear and the silk ones are gorgeous for special occasions.",
      image: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-rose-50 px-4 sm:px-6 py-2 rounded-full text-rose-gold font-medium mb-4 text-sm sm:text-base">
            Customer Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mahogany mb-4 sm:mb-6">
            What Our <span className="text-rose-gold">Customers Say</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from thousands of satisfied customers who love our kurtis
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 sm:p-8 relative hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-rose-gold opacity-50" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, index) => (
                  <Star key={index} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base italic">
                "{testimonial.comment}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-rose-gold"
                />
                <div>
                  <h4 className="font-semibold text-mahogany text-sm sm:text-base">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs sm:text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-flex items-center bg-gradient-to-r from-rose-gold to-copper text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current mr-2" />
            <span className="text-lg sm:text-xl font-bold mr-2">4.8/5</span>
            <span className="text-sm sm:text-base opacity-90">from 2,500+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;