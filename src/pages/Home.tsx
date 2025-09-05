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
      {/* <FeaturedProducts /> */}
      <WhyChooseUs />
    
      
    </div>
  );
};

export default Home;
