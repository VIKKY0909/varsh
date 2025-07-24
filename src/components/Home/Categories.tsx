import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  category: string;
  count: number;
  description?: string;
  image?: string;
}

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

  // Default category information for enriching the data
  const categoryInfo = {
    casual: {
      name: "Casual Kurtis",
      description: "",
      image: ""
    },
    formal: {
      name: "Formal Kurtis", 
      description: "Professional and elegant",
      image: ""
    },
    party: {
      name: "Party Wear",
      description: "Glamorous evening styles", 
      image: ""
    },
    festive: {
      name: "Festive Collection",
      description: "Traditional celebration wear",
      image: ""
    }
  };

  // Fetch categories with product counts from backend
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get category counts from products table
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .gt('stock_quantity', 0); // Only count in-stock products

      if (error) throw error;

      // Count products by category
      const categoryCounts: { [key: string]: number } = {};
      data?.forEach(product => {
        const category = product.category?.toLowerCase();
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });

      // Create category data with counts and additional info
      const categoryData: CategoryData[] = Object.entries(categoryCounts)
        .map(([categoryKey, count]) => {
          const info = categoryInfo[categoryKey as keyof typeof categoryInfo];
          if (!info) return null; // Skip unknown categories
          
          return {
            id: categoryKey,
            name: info.name,
            description: info.description,
            image: info.image,
            path: `/products?category=${categoryKey}`,
            count: `${count}+ Design${count !== 1 ? 's' : ''}`
          };
        })
        .filter(Boolean) as CategoryData[];

      // Sort categories by count (descending)
      categoryData.sort((a, b) => {
        const aCount = parseInt(a.count);
        const bCount = parseInt(b.count);
        return bCount - aCount;
      });

      setCategories(categoryData);

    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      
      // Fallback to default categories without counts
      const fallbackCategories: CategoryData[] = Object.entries(categoryInfo).map(([key, info]) => ({
        id: key,
        name: info.name,
        description: info.description,
        image: info.image,
        path: `/products?category=${key}`,
        count: "Available"
      }));
      
      setCategories(fallbackCategories);
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
                <div className="p-4 sm:p-6">
                  <div className="bg-gray-200 h-6 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded mb-3"></div>
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
