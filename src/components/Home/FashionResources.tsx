import React from 'react';
import { ExternalLink } from 'lucide-react';

const FashionResources = () => {
  const resources = [
    {
      title: "Traditional Indian Fashion History",
      description: "Learn about the rich heritage of Indian ethnic wear",
      url: "https://en.wikipedia.org/wiki/Indian_clothing",
      category: "Culture"
    },
    {
      title: "Sustainable Fashion Guide",
      description: "Understanding eco-friendly fashion practices",
      url: "https://www.sustainablefashion.earth/",
      category: "Sustainability"
    },
    {
      title: "Textile Crafts of India",
      description: "Explore traditional Indian textile techniques",
      url: "https://www.incredibleindia.org/content/incredible-india-v2/en/experiences/arts-crafts/textiles.html",
      category: "Crafts"
    }
  ];

  return (
    <section className="py-16 bg-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-mahogany mb-4">
            Explore Fashion & Culture
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the rich heritage and sustainable practices behind ethnic fashion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                  {resource.category}
                </span>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-mahogany mb-3">
                {resource.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {resource.description}
              </p>
              
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-rose-gold hover:text-mahogany font-semibold group"
              >
                Learn More
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FashionResources;