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
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Shopping",
      description: "Your data and payments are protected with industry-leading security and privacy standards."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-mahogany via-rose-900 to-mahogany text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFC0CB' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm-20-20c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm40 0c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm0 40c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm-40 0c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold px-5 sm:px-8 py-2 rounded-full text-base sm:text-lg font-semibold mb-7 shadow-md">
            Why Choose Varsh Kurtis
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-7 leading-tight">
            Crafting Excellence
            
          </h2>
          <p className="text-lg sm:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
            We're passionate about creating beautiful kurtis that celebrate tradition while embracing modern style. Here's what makes us special.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-4xl lg:max-w-6xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center bg-white/10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-7 sm:p-8 group"
            >
              <div className="bg-gradient-to-br from-blush-pink to-rose-gold p-4 rounded-full w-16 h-16 flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:shadow-xl transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-blush-pink transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;