import React from 'react';
import Hero from '../components/Home/Hero';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import Categories from '../components/Home/Categories';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import Testimonials from '../components/Home/Testimonials';
import FashionResources from '../components/Home/FashionResources';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Categories />
      {/* <FeaturedProducts /> */}
      <WhyChooseUs />
      <FashionResources />
      {/* <Testimonials /> */}
    </div>
  );
};

export default Home;