import React from 'react';
import Hero from '../components/Home/Hero';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import Categories from '../components/Home/Categories';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Varsh Ethnic Wears - Buy Kurti Online | Premium Handcrafted Kurtis & Sarees"
        description="Shop premium handcrafted kurtis & ethnic wear at Varsh ethnic wears. Buy kurti online for casual outings, everyday wear, and festive occasions. Authentic Indian ethnic wear with intricate detailing."
        keywords="kurtis online, buy kurti, kurtas for women, casual outings, everyday wear, Indian ethnic wear, intricate detailing, daily wear, festive kurtis, Varsh ethnic wears, handcrafted sarees, lehengas, women's ethnic fashion, latest kurti, wide range"
        canonicalUrl="https://varshethnicwears.com/"
      />
      <Hero />
      <Categories />
      <WhyChooseUs />
    </div>
  );
};

export default Home;
