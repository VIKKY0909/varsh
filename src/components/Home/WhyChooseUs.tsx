import React from 'react';
import { Award, Truck, Shield, Heart, Scissors, Sparkles } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Hand-selected fabrics and meticulous craftsmanship ensure every kurti meets our exacting standards"
    },
    {
      icon: <Scissors className="w-8 h-8" />,
      title: "Expert Tailoring",
      description: "Skilled artisans with decades of experience create perfectly fitted kurtis for every body type"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Quick and secure shipping across India with real-time tracking and careful packaging"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Ethical Sourcing",
      description: "Supporting local artisans and sustainable practices in every aspect of our business"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Unique Designs",
      description: "Exclusive patterns and contemporary styles that you won't find anywhere else"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-mahogany via-rose-900 to-mahogany text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFC0CB' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm-20-20c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm40 0c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm0 40c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm-40 0c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium mb-6">
            Why Choose Varsh Kurtis
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Crafting Excellence Since 
            <span className="block text-blush-pink">2020</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            We're passionate about creating beautiful kurtis that celebrate tradition while embracing modern style. Here's what makes us special.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-blush-pink to-rose-gold p-3 sm:p-4 rounded-2xl w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 group-hover:text-blush-pink transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="group hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blush-pink mb-2">5k+</div>
            <div className="text-sm sm:text-base text-gray-300">Happy Customers</div>
          </div>
          <div className="group hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blush-pink mb-2">200+</div>
            <div className="text-sm sm:text-base text-gray-300">Unique Designs</div>
          </div>
          <div className="group hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blush-pink mb-2">4.8★</div>
            <div className="text-sm sm:text-base text-gray-300">Average Rating</div>
          </div>
          <div className="group hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blush-pink mb-2">99%</div>
            <div className="text-sm sm:text-base text-gray-300">Satisfaction Rate</div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default WhyChooseUs;