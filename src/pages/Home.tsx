import React from 'react';
import Hero from '../components/Home/Hero';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import Categories from '../components/Home/Categories';
import WhyChooseUs from '../components/Home/WhyChooseUs';



const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
     
      <WhyChooseUs />
    
      {/* new */}
    </div>
  );
};

export default Home;
