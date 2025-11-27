import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://varshethnicwears.com';

// Static routes with priorities
const staticRoutes = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/products', priority: 0.9, changefreq: 'daily' },
    { path: '/about', priority: 0.8, changefreq: 'weekly' },
    { path: '/contact', priority: 0.7, changefreq: 'monthly' },
    { path: '/varsh-ethnic-wears', priority: 0.95, changefreq: 'daily' },
    { path: '/ethnic-wear-collection', priority: 0.9, changefreq: 'daily' },
    { path: '/handcrafted-kurtis', priority: 0.9, changefreq: 'daily' },
    { path: '/traditional-indian-clothing', priority: 0.9, changefreq: 'daily' },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
];

// Category routes
const categoryRoutes = [
    { path: '/products?category=casual', priority: 0.8, changefreq: 'weekly' },
    { path: '/products?category=formal', priority: 0.8, changefreq: 'weekly' },
    { path: '/products?category=party', priority: 0.8, changefreq: 'weekly' },
    { path: '/products?category=festive', priority: 0.8, changefreq: 'weekly' },
];

async function fetchProducts() {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('id, updated_at')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return products || [];
    } catch (error) {
        console.error('Error in fetchProducts:', error);
        return [];
    }
}

function generateSitemapXML(routes) {
    const today = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    routes.forEach(route => {
        xml += '  <url>\n';
        xml += `    <loc>${SITE_URL}${route.path}</loc>\n`;
        xml += `    <lastmod>${route.lastmod || today}</lastmod>\n`;
        xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
        xml += `    <priority>${route.priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';
    return xml;
}

async function generateSitemap() {
    console.log('🚀 Generating dynamic sitemap...\n');

    // Fetch products from database
    console.log('📦 Fetching products from Supabase...');
    const products = await fetchProducts();
    console.log(`✅ Found ${products.length} products\n`);

    // Combine all routes
    const allRoutes = [
        ...staticRoutes,
        ...categoryRoutes,
    ];

    // Add product routes
    products.forEach(product => {
        allRoutes.push({
            path: `/product/${product.id}`,
            priority: 0.7,
            changefreq: 'weekly',
            lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : null,
        });
    });

    console.log(`📊 Total URLs in sitemap: ${allRoutes.length}`);
    console.log(`   - Static routes: ${staticRoutes.length}`);
    console.log(`   - Category routes: ${categoryRoutes.length}`);
    console.log(`   - Product routes: ${products.length}\n`);

    // Generate XML
    const sitemapXML = generateSitemapXML(allRoutes);

    // Write to file
    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXML, 'utf-8');

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📁 Location: ${outputPath}\n`);
    console.log(`🌐 Submit to Google Search Console:`);
    console.log(`   ${SITE_URL}/sitemap.xml\n`);
}

// Run the script
generateSitemap().catch(console.error);
