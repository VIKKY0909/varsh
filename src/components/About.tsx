import React from 'react';
import { Award, Users, Heart, Sparkles, Star } from 'lucide-react';

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
        {/* Founder Story Section */}
        <div className="text-center mb-20">
          <div className="inline-block bg-gradient-to-r from-blush-pink to-rose-gold px-6 py-2 rounded-full text-sm font-medium mb-6">
            Our Story
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
            We didn't just start a label—we started an 
            <span className="block text-blush-pink">एहसास</span>
          </h2>
          
          <p className="text-xl text-gray-100 mb-6 leading-relaxed max-w-4xl mx-auto">
            A feeling that every skin tone deserves to shine. A belief that <span className="text-blush-pink font-semibold">सुंदरता</span> isn't one-size-fits-all.
          </p>
          
          <p className="text-lg text-gray-200 mb-8 max-w-4xl mx-auto">
            We're <span className="text-blush-pink font-semibold">Varsha</span> (Founder & CEO), <span className="text-blush-pink font-semibold">Vivek</span> and <span className="text-blush-pink font-semibold">Ayush</span> (Co-founders)—three friends who grew up surrounded by <span className="text-blush-pink font-semibold">रंग, रिवाज़, and रूट्स</span>. And we wanted to bring all of that into fashion that feels like <span className="text-blush-pink font-semibold">अपनापन</span>.
          </p>
        </div>

        {/* Founder Images and Story */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content - Founder Image */}
          <div className="relative">
            <div className="relative">
              <img
                src="../../public/founder.jpg"
                alt="Varsh Leadership Team - Varsha (Founder & CEO), Vivek & Ayush (Co-founders)"
                className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-xl font-bold mb-2">Our Leadership Team</h3>
                <p className="text-sm opacity-90">Varsha (Founder & CEO), Vivek & Ayush (Co-founders) - Bringing tradition to life</p>
              </div>
            </div>
          </div>

          {/* Right Content - Story */}
          <div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-blush-pink">
                Our Kurtis Carry परंपरा
              </h3>
              
              <p className="text-lg text-gray-100 mb-6 leading-relaxed">
                Our kurtis are not just stitched for style—they carry <span className="text-blush-pink font-semibold">परंपरा</span> with a touch of today. From soft cottons to vibrant prints, from festive <span className="text-blush-pink font-semibold">जश्न</span> to daily comfort—each piece is made with love for <span className="text-blush-pink font-semibold">हर रंग की त्वचा</span> and <span className="text-blush-pink font-semibold">हर दिल का अंदाज़</span>.
              </p>
              
              <p className="text-lg text-gray-100 mb-6 leading-relaxed">
                This is not just ethnic wear. This is your story, <span className="text-blush-pink font-semibold">आपकी पहचान</span>.
              </p>
              
              <div className="flex items-center gap-2 text-blush-pink">
                <Star className="w-5 h-5" />
                <span className="text-xl font-bold">Style for Every Skin. Designed for Every Soul.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content - Team Story */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-blush-pink">
              Crafting Elegance Since 1999
            </h3>
            
            <p className="text-xl text-gray-100 mb-8 leading-relaxed">
              At Varsh Ethnic Wears, we believe that traditional clothing is more than just fabric and thread—it's a celebration of culture, artistry, and timeless beauty. Our journey began with a simple vision: to preserve the rich heritage of Indian ethnic wear while making it accessible to modern women.
            </p>
            
            <p className="text-lg text-gray-200 mb-8">
              Each piece in our collection is carefully crafted by skilled artisans who have inherited their techniques from generations past. We source the finest materials from across India, ensuring that every saree, lehenga, and kurta meets our exacting standards of quality and authenticity.
            </p>

            <button className="bg-gradient-to-r from-blush-pink to-rose-gold text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Explore Our Collection
            </button>
          </div>

          {/* Right Content - Team Image */}
          <div className="relative">
            <div className="relative">
              <img
                src="../../public/team.jpg"
                alt="Varsh Team"
                className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-xl font-bold mb-2">Our Dedicated Team</h3>
                <p className="text-sm opacity-90">Passionate artisans and designers working together</p>
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