import React from 'react';
import { Heart, Award, Users, Globe, Shield, Truck, Star } from 'lucide-react';

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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-gold to-copper text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About Varsh Ethnic Wears</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            We are passionate about bringing the authentic beauty of Indian ethnic wear to women worldwide, 
            connecting modern fashion with traditional craftsmanship.
          </p>
        </div>
      </div>

      {/* Story Section */}
      {/* Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-mahogany mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  We didn't just start a label—we started an <span className="font-semibold text-mahogany">एहसास</span>. 
                  A feeling that every skin tone deserves to shine. A belief that <span className="font-semibold text-mahogany">सुंदरता</span> isn't one-size-fits-all.
                </p>
                <p>
                  We're <span className="font-semibold text-mahogany">Varsha</span> (Founder & CEO), <span className="font-semibold text-mahogany">Vivek</span> and <span className="font-semibold text-mahogany">Ayush</span> (Co-founders)—three friends who grew up surrounded by <span className="font-semibold text-mahogany">रंग, रिवाज़, and रूट्स</span>. 
                  And we wanted to bring all of that into fashion that feels like <span className="font-semibold text-mahogany">अपनापन</span>.
                </p>
                <p>
                  Our kurtis are not just stitched for style—they carry <span className="font-semibold text-mahogany">परंपरा</span> with a touch of today. 
                  From soft cottons to vibrant prints, from festive <span className="font-semibold text-mahogany">जश्न</span> to daily comfort—each piece is made with love for 
                  <span className="font-semibold text-mahogany">हर रंग की त्वचा</span> and <span className="font-semibold text-mahogany">हर दिल का अंदाज़</span>.
                </p>
                <p className="text-xl font-semibold text-mahogany">
                  This is not just ethnic wear. This is your story, <span className="text-rose-gold">आपकी पहचान</span>.
                </p>
                <p className="text-lg font-medium text-copper">
                  Style for Every Skin. Designed for Every Soul.
                </p>
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
      
      {/* Stats Section */}
      {/* <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-mahogany text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-rose-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-mahogany mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

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
           <h2 className="text-3xl font-bold text-mahogany text-center mb-12">Meet Our Leadership Team</h2>
           
           {/* Founder Section */}
           <div className="mb-16">
             <div className="grid lg:grid-cols-2 gap-12 items-center">
               <div className="relative">
                 <img
                   src="../../public/founder.jpg"
                   alt="Varsha - Founder & CEO of Varsh Ethnic Wears"
                   className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
                 <div className="absolute bottom-8 left-8 right-8 text-white">
                   <h3 className="text-2xl font-bold mb-2">Varsha</h3>
                   <p className="text-lg font-medium text-rose-gold">Founder & CEO</p>
                   <p className="text-sm opacity-90 mt-2">Passionate about bringing authentic ethnic wear to modern women and celebrating every skin tone.</p>
                 </div>
               </div>
               <div className="bg-gradient-to-br from-rose-50 to-copper-50 p-8 rounded-2xl">
                 <h3 className="text-2xl font-bold text-mahogany mb-6">Our Founder's Vision</h3>
                 <div className="space-y-4 text-gray-700">
                   <p className="text-lg leading-relaxed">
                     Varsha leads our mission to celebrate <span className="font-semibold text-mahogany">हर रंग की त्वचा</span> (every skin tone) 
                     through authentic ethnic wear that carries <span className="font-semibold text-mahogany">परंपरा</span> (tradition) with a modern touch.
                   </p>
                   <p className="text-lg leading-relaxed">
                     Her vision is to create fashion that feels like <span className="font-semibold text-mahogany">अपनापन</span> (belonging), 
                     where every woman can find her perfect style that celebrates her unique beauty.
                   </p>
                   <div className="flex items-center gap-2 text-mahogany mt-6">
                     <Star className="w-5 h-5" />
                     <span className="font-semibold">Style for Every Skin. Designed for Every Soul.</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Co-founders Section */}
           <div className="grid lg:grid-cols-2 gap-12 items-center">
             <div className="bg-gradient-to-br from-rose-50 to-copper-50 p-8 rounded-2xl">
               <h3 className="text-2xl font-bold text-mahogany mb-6">Our Co-founders</h3>
               <div className="space-y-6">
                 <div className="border-l-4 border-rose-gold pl-6">
                   <h4 className="text-xl font-semibold text-mahogany mb-2">Vivek</h4>
                   <p className="text-rose-gold font-medium mb-2">Co-founder</p>
                   <p className="text-gray-700">Ensuring seamless operations and customer satisfaction with a focus on quality and excellence.</p>
                 </div>
                 <div className="border-l-4 border-rose-gold pl-6">
                   <h4 className="text-xl font-semibold text-mahogany mb-2">Ayush</h4>
                   <p className="text-rose-gold font-medium mb-2">Co-founder</p>
                   <p className="text-gray-700">Curating the finest collection of ethnic wear from across India with traditional values and modern appeal.</p>
                 </div>
               </div>
             </div>
             <div className="relative">
               <img
                 src="../../public/team.jpg"
                 alt="Varsh Team - Vivek and Ayush, Co-founders"
                 className="w-full h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-3xl"></div>
               <div className="absolute bottom-8 left-8 right-8 text-white">
                 <h3 className="text-2xl font-bold mb-2">Our Dedicated Team</h3>
                 <p className="text-lg font-medium text-rose-gold">Vivek & Ayush - Co-founders</p>
                 <p className="text-sm opacity-90 mt-2">Working together to bring you the best of Indian ethnic wear with passion and dedication.</p>
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