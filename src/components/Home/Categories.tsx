import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CategoryData {
  id: string;
  name: string;
  description: string;
  image: string;
  path: string;
  count: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and their counts from the backend
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get all unique categories from products
      const { data: categoryData, error: categoryError } = await supabase
        .from('products')
        .select('category')
        .gt('stock_quantity', 0);

      if (categoryError) throw categoryError;

      // Get unique categories
      const uniqueCategories = [...new Set(categoryData?.map(item => item.category).filter(Boolean))];

      if (uniqueCategories.length === 0) {
        setCategories([]);
        return;
      }

      // Get sample images for each category (first product image from each category)
      const categoryPromises = uniqueCategories.map(async (category) => {
        try {
          // Get count for this category
          const { count, error: countError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', category)
            .gt('stock_quantity', 0);

          if (countError) throw countError;

          // Get a sample image from this category
          const { data: sampleProduct, error: imageError } = await supabase
            .from('products')
            .select('images, name')
            .eq('category', category)
            .gt('stock_quantity', 0)
            .limit(1)
            .single();

          if (imageError) {
            console.warn(`No sample image found for category: ${category}`);
          }

          // Generate category display name and description
          const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
          const descriptions: { [key: string]: string } = {
            'casual': 'Comfortable everyday wear',
            'formal': 'Professional and elegant',
            'party': 'Glamorous evening styles',
            'festive': 'Traditional celebration wear',
            'ethnic': 'Traditional ethnic wear',
            'western': 'Modern western styles',
            'wedding': 'Special occasion wear',
            'office': 'Professional workplace attire'
          };

          return {
            id: category,
            name: `${categoryName} Kurtis`,
            description: descriptions[category.toLowerCase()] || `Beautiful ${category.toLowerCase()} collection`,
            image: (sampleProduct?.images && sampleProduct.images.length > 0) 
              ? sampleProduct.images[0] 
              : "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&w=600",
            path: `/products?category=${category}`,
            count: count ? `${count}+ Design${count !== 1 ? 's' : ''}` : "Available"
          };
        } catch (error) {
          console.error(`Error processing category ${category}:`, error);
          return {
            id: category,
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Kurtis`,
            description: `Beautiful ${category.toLowerCase()} collection`,
            image: "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&w=600",
            path: `/products?category=${category}`,
            count: "Available"
          };
        }
      });

      const categoriesWithData = await Promise.all(categoryPromises);
      
      // Sort by count (extract number from string for proper sorting)
      categoriesWithData.sort((a, b) => {
        const aCount = parseInt(a.count) || 0;
        const bCount = parseInt(b.count) || 0;
        return bCount - aCount;
      });

      setCategories(categoriesWithData);

    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="animate-pulse bg-gray-200 h-8 w-48 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-12 w-96 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-80 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gray-200 h-48 sm:h-56 lg:h-64"></div>
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="bg-gray-200 h-6 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-32 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
            {error}
            <button 
              onClick={fetchCategories}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block bg-rose-50 px-4 sm:px-6 py-2 rounded-full text-rose-gold font-medium mb-4 text-sm sm:text-base">
            Shop by Category
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mahogany mb-4 sm:mb-6">
            Find Your Perfect <span className="text-rose-gold">Kurti</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our diverse collection designed for every occasion and style preference
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories available at the moment.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center text-rose-gold hover:text-rose-800 font-medium"
            >
              Browse All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.path}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback image if the original fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&w=600";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-mahogany">
                    {category.count}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 group-hover:text-blush-pink transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm sm:text-base opacity-90 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm font-medium group-hover:text-blush-pink transition-colors">
                    Explore Collection
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center bg-white border-2 border-rose-gold text-rose-gold px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-rose-gold hover:text-white transition-all duration-300 shadow-lg"
          >
            View All Kurtis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
