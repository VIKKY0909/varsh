import React from 'react';
import { Award, Users, Heart, Sparkles } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Hand-selected fabrics and meticulous craftsmanship ensure every piece meets our exacting standards"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Skilled Artisans",
      description: "Working with master craftsmen who have passed down their skills through generations"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Ethical Sourcing",
      description: "Supporting local communities and sustainable practices in every aspect of our business"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Timeless Designs",
      description: "Blending traditional motifs with contemporary aesthetics for modern ethnic wear"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-mahogany via-rose-900 to-mahogany text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFC0CB' fill-opacity='0.3'%3E%3Cpath d='M50 50c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm-20-20c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm40 0c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm0 40c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10zm-40 0c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold px-6 py-2 rounded-full text-sm font-medium mb-6">
              Our Heritage
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Crafting Elegance Since 
              <span className="block text-blush-pink">1999</span>
            </h2>
            
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              At Varsh Ethnic Wears, we believe that traditional clothing is more than just fabric and thread—it's a celebration of culture, artistry, and timeless beauty. Our journey began with a simple vision: to preserve the rich heritage of Indian ethnic wear while making it accessible to modern women.
            </p>
            
            <p className="text-lg text-gray-200 mb-8">
              Each piece in our collection is carefully crafted by skilled artisans who have inherited their techniques from generations past. We source the finest materials from across India, ensuring that every saree, lehenga, and kurta meets our exacting standards of quality and authenticity.
            </p>

           

            <button className="bg-gradient-to-r from-blush-pink to-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Our Story
            </button>
          </div>

          {/* Right Content - Image */}
          <div className="relative">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/6311611/pexels-photo-6311611.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Artisan at work"
                className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-xl font-bold mb-2">Master Craftmanship</h3>
                <p className="text-sm opacity-90">Every stitch tells a story of dedication and skill</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-gradient-to-br from-blush-pink to-rose-gold p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-blush-pink transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;