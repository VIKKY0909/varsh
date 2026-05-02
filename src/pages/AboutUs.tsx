import React from 'react';
import { Heart, Award, Users, Globe, Shield, Truck, Star } from 'lucide-react';
import teamImage from '../public/team.jpg';
import SEO from '../components/SEO';

const AboutUs = () => {
  const stats = [
    { number: '5000+', label: 'Happy Customers', icon: Users },
    { number: '1000+', label: 'Products', icon: Award },
    { number: '50+', label: 'Artisan Partners', icon: Heart },
    { number: '25+', label: 'Cities Served', icon: Globe }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Authenticity',
      description: 'We source directly from skilled artisans to bring you authentic ethnic wear from across India.'
    },
    {
      icon: Shield,
      title: 'Quality',
      description: 'Every piece is crafted with premium materials and attention to detail.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Supporting local artisans and preserving traditional craftsmanship.'
    },
    {
      icon: Globe,
      title: 'Heritage',
      description: 'Celebrating India\'s rich cultural diversity through fashion.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="About Varsh Ethnic Wears | Our Story & Heritage"
        description="Learn about Varsh Ethnic Wears, our journey, and our mission to bring authentic Indian ethnic wear to women worldwide. Meet our founders Varsha, Vivek, and Ayush."
        keywords="about varsh ethnic wears, indian ethnic wear, handcrafted kurtis, artisan partners, cultural heritage, women's fashion, ethnic wear brand"
        canonicalUrl="https://varshethnicwears.com/about"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-gold to-copper text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About Varsh Ethnic Wears</h1>
          <p className="text-xl opacity-90 max-w-4xl mx-auto leading-relaxed">
            Founded by Varsha Parmar with a clear mission: to make premium-quality Indian ethnic wear 
            accessible and affordable for every woman across India.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-mahogany mb-6">Our Mission</h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p>
                  Varsh Ethnic Wears is an Indian ethnic clothing brand founded by <span className="font-semibold text-mahogany">Varsha Parmar</span> with one clear mission — to make premium-quality kurtis accessible to every woman across India. From college girls looking for trendy short kurtis to working women seeking elegant office wear kurtis, Varsh Ethnic Wears has something beautiful for everyone at prices that never compromise your budget.
                </p>
                <p>
                  Every kurti in our collection is handcrafted with care, made from quality fabrics, and designed to celebrate the modern Indian woman. Whether you're searching for a casual daily-wear kurti, a festive kurti set with dupatta, or a straight-cut kurti for office, you'll find it all right here starting from just <span className="font-bold text-rose-gold">₹399</span>.
                </p>
                <p>
                  We deliver <span className="font-medium">pan-India</span>, so no matter where you are — Gujarat, Maharashtra, Delhi, Rajasthan, or beyond — your perfect kurti is just a click away.
                </p>
                <div className="bg-rose-50 border-l-4 border-rose-gold p-6 rounded-r-xl italic">
                  "At Varsh Ethnic Wears, we believe that every woman deserves to look her best without spending a fortune. That belief is stitched into every piece we create."
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-copper-50 p-8 rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-rose-gold mr-3" />
                  <span className="text-gray-700">Fashion that feels like <span className="font-medium">अपनापन</span></span>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-rose-gold mr-3" />
                  <span className="text-gray-700">Celebrating every skin tone</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-rose-gold mr-3" />
                  <span className="text-gray-700"><span className="font-medium">परंपरा</span> with a touch of today</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-rose-gold mr-3" />
                  <span className="text-gray-700">Made with love for every style</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-mahogany text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-mahogany mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-gradient-to-r from-rose-50 to-copper-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-mahogany mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To preserve and promote India's rich cultural heritage through authentic ethnic wear,
                while supporting local artisans and providing modern women with beautiful,
                high-quality traditional clothing that celebrates their roots.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-mahogany mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To become the leading platform for authentic Indian ethnic wear globally,
                connecting artisans with customers worldwide and ensuring that traditional
                craftsmanship continues to thrive in the modern world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-mahogany text-center mb-12">Meet Our Founder</h2>

          {/* Founder Image and Info */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753381104151-k74ejjejt-0.jpg"
                alt="Varsh Ethnic Wears - Signature Collection"
                className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Varsha Parmar</h3>
                <p className="text-lg font-medium text-rose-gold">Founder & CEO</p>
                <p className="text-sm opacity-90 mt-2">Visionary behind the brand, bringing ethnic elegance to every home.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-copper-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-mahogany mb-6">Our Leadership</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-rose-gold pl-6">
                  <h4 className="text-xl font-semibold text-mahogany mb-2">Varsha Parmar</h4>
                  <p className="text-rose-gold font-medium mb-2">Founder & CEO</p>
                  <p className="text-gray-700 leading-relaxed">
                    Varsha Parmar started Varsh Ethnic Wears with a simple yet powerful dream: to see every Indian woman embrace her roots with pride and style. As the sole visionary behind the brand, she personally oversees the curation of every fabric and design, ensuring that quality and affordability go hand-in-hand. 
                  </p>
                  <p className="text-gray-700 mt-4 leading-relaxed">
                    Her mission is to celebrate <span className="font-semibold text-mahogany">हर भारतीय नारी</span> through authentic ethnic wear that carries the weight of <span className="font-semibold text-mahogany">परंपरा</span> with a graceful modern touch.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-mahogany mt-6 pt-4 border-t border-rose-gold/30">
                  <Star className="w-5 h-5" />
                  <span className="font-semibold">Empowering Women. Preserving Tradition.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-mahogany text-center mb-12">Why Choose Varsh Ethnic Wears?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Authentic Craftsmanship</h3>
              <p className="text-gray-600">
                Every piece is handcrafted by skilled artisans using traditional techniques passed down through generations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                We carefully select premium materials and ensure every product meets our high quality standards.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Fast & Secure Delivery</h3>
              <p className="text-gray-600">
                Nationwide delivery with secure packaging and real-time tracking for your peace of mind.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Customer Support</h3>
              <p className="text-gray-600">
                Our dedicated team is here to help you with any questions or concerns about your order.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Wide Selection</h3>
              <p className="text-gray-600">
                From casual kurtis to party wear, we offer a diverse collection to suit every occasion.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-mahogany mb-3">Cultural Heritage</h3>
              <p className="text-gray-600">
                Celebrate India's diverse cultural heritage through our carefully curated ethnic wear collection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-rose-gold to-copper text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Explore Our Collection?</h2>
          <p className="text-xl opacity-90 mb-8">
            Discover the beauty of authentic Indian ethnic wear crafted with love and tradition.
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-rose-gold px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;