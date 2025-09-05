import React from 'react';
import Hero from '../components/Home/Hero';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import Categories from '../components/Home/Categories';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import Testimonials from '../components/Home/Testimonials';


const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      {/* <FeaturedProducts /> */}
      <WhyChooseUs />
    
      {/* <Testimonials /> */}
    </div>
  );
};

export default Home;
