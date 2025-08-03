import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle,
  Clock,
  Truck,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminOrders from './AdminOrders';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  category: string;
  size: string[];
  color: string;
  material: string;
  care_instructions: string;
  stock_quantity: number;
  is_featured: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  created_at: string;
  updated_at?: string;
  images: string[];
  description?: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  payment_status: string;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  notes: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  order_items: {
    id: string;
    quantity: number;
    size: string;
    price: number;
    product_id: string;
    product: {
      name: string;
      images: string[];
    };
  }[];
  user: {
    email: string;
    user_profiles: {
      full_name: string;
      phone: string;
    };
  };
}

  interface User {
    id: string;
    full_name: string;
    email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  is_admin: boolean;
  created_at: string;
  profile_status?: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });

  // Product Add/Edit Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    original_price: '',
    category: '',
    size: '', // comma-separated string for input
    color: '',
    material: '',
    care_instructions: '',
    stock_quantity: '',
    is_featured: false,
    description: '',
    images: [] as string[],
  });
  const [productFormError, setProductFormError] = useState('');

  // Product Search State
  const [productSearch, setProductSearch] = useState('');
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  // Product View Modal State
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!user || user.email !== 'vikivahane@gmail.com') {
      navigate('/');
      return;
    }
    
    // Debug: Check authentication status
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
    };
    
    checkAuthStatus();
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Debug: Check authentication state
      const { data: { session } } = await supabase.auth.getSession();

      // Test authentication with a simple query first
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('count')
        .limit(1);

      if (testError) {
        if (testError.code === 'PGRST301') {
        }
        throw testError;
      }

      // Fetch products with error handling
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        throw productsError;
      }

      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            size,
            price,
            product_id,
            products!order_items_product_id_fkey(
              id,
              name,
              images
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
      }

      // Get real user emails using the database function
      let userEmailsMap = new Map();
      let completeUsersData: User[] = [];
      
      try {
        // Use the new function that gets ALL users
        const { data: adminUserData, error: adminUserError } = await supabase
          .rpc('get_all_users_for_admin');

        if (!adminUserError && adminUserData) {
          adminUserData.forEach((user: any) => {
            userEmailsMap.set(user.user_id, user.email || 'N/A');
          });
          
          completeUsersData = adminUserData.map((user: any) => ({
            id: user.user_id,
            full_name: user.full_name || 'Not set',
            email: user.email || 'N/A',
            phone: user.phone || 'Not set',
            gender: user.gender || 'Not set',
            date_of_birth: user.date_of_birth || 'N/A',
            is_admin: user.is_admin || false,
            created_at: user.created_at,
            profile_status: user.profile_status || 'Unknown'
          }));
        } else {
          // Fallback: get from user_profiles
          const { data: userProfilesData, error: userProfilesError } = await supabase
        .from('user_profiles')
            .select('*');

          if (!userProfilesError && userProfilesData) {
            userProfilesData.forEach(profile => {
              userEmailsMap.set(profile.user_id, profile.email || 'N/A');
            });
            
            completeUsersData = userProfilesData.map((profile: any) => ({
              id: profile.user_id,
              full_name: profile.full_name || 'N/A',
              email: profile.email || 'N/A',
              phone: profile.phone || 'N/A',
              gender: profile.gender || 'N/A',
              date_of_birth: profile.date_of_birth || 'N/A',
              is_admin: profile.is_admin || false,
              created_at: profile.created_at,
              profile_status: 'Profile Complete'
            }));
          }
        }
      } catch (error) {
        // Continue with empty data
      }

      // Merge orders with complete user data
      const ordersWithUserData = ordersData?.map(order => {
        const userEmail = userEmailsMap.get(order.user_id) || 'N/A';
        
        return {
          ...order,
          user: {
            email: userEmail,
            user_profiles: {
              full_name: completeUsersData.find((u: any) => u.id === order.user_id)?.full_name || 'N/A',
              phone: completeUsersData.find((u: any) => u.id === order.user_id)?.phone || 'N/A',
              gender: completeUsersData.find((u: any) => u.id === order.user_id)?.gender || 'N/A',
              date_of_birth: completeUsersData.find((u: any) => u.id === order.user_id)?.date_of_birth || 'N/A',
              is_admin: completeUsersData.find((u: any) => u.id === order.user_id)?.is_admin || false
            }
          }
        };
      }) || [];

      setProducts(productsData || []);
      setOrders(ordersWithUserData || []);
      setUsers(completeUsersData || []);

      // Calculate stats
      const totalRevenue = ordersWithUserData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const pendingOrders = ordersWithUserData?.filter(order => order.status === 'pending').length || 0;
      const lowStockProducts = productsData?.filter(product => product.stock_quantity < 5).length || 0;
      
      setStats({
        totalProducts: productsData?.length || 0,
        totalOrders: ordersWithUserData?.length || 0,
        totalRevenue,
        totalUsers: completeUsersData?.length || 0,
        pendingOrders,
        lowStockProducts
      });

    } catch (error) {
      // Show user-friendly error message
      alert('Failed to load dashboard data. Please check your authentication and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select();

      if (error) {
        throw error;
      }

      // Add tracking entry
      const { error: trackingError } = await supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `Order status updated to ${newStatus} by admin.`
        });

      if (trackingError) {
      }

      // Create notification for user
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            type: 'order',
            title: 'Order Status Updated',
            message: `Your order ${order.order_number} status has been updated to ${newStatus}.`,
            action_url: `/orders`
          });

        if (notificationError) {
        }
      }

      // Re-fetch orders from backend to get latest status
      await fetchDashboardData();
    } catch (error) {
      alert('Failed to update order status. Please try again.');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    try {
      // Delete order items first
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Delete order tracking
      await supabase
        .from('order_tracking')
        .delete()
        .eq('order_id', orderId);

      // Delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order Number', 'Date', 'Customer', 'Amount', 'Status', 'Items'],
      ...orders.map(order => [
        order.order_number,
        new Date(order.created_at).toLocaleDateString(),
        order.shipping_address?.full_name || 'N/A',
        `₹${order.total_amount.toLocaleString()}`,
        order.status,
        order.order_items.reduce((sum, item) => sum + item.quantity, 0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProductImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setProductFormError('');
    const uploadedUrls: string[] = [];
    
    try {
      // Upload multiple images
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setProductFormError('Please upload only image files.');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setProductFormError('Image size should be less than 5MB.');
          return;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}.${fileExt}`;
        
      const { error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
        
      if (error) {
          setProductFormError(`Failed to upload image ${i + 1}.`);
        return;
      }
        
        // Get public URL
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (!publicUrlData || !publicUrlData.publicUrl) {
          setProductFormError(`Failed to get URL for image ${i + 1}.`);
        return;
      }
        
        uploadedUrls.push(publicUrlData.publicUrl);
      }
      
      // Update form with new images
      setProductForm(f => ({ 
        ...f, 
        images: [...f.images, ...uploadedUrls]
      }));
      
    } catch (err) {
      setProductFormError('Unexpected error during image upload.');
    }
  };

  const removeImage = (index: number) => {
    setProductForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-mahogany">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, Admin</span>
              <div className="w-8 h-8 bg-rose-gold rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'products', name: 'Products', icon: Package },
              { id: 'orders', name: 'Orders', icon: ShoppingCart },
              { id: 'users', name: 'Users', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-rose-gold text-white'
                    : 'text-gray-600 hover:text-rose-gold hover:bg-rose-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Products</p>
                    <p className="text-3xl font-bold text-mahogany">{stats.totalProducts}</p>
                  </div>
                  <Package className="w-8 h-8 text-rose-gold" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-3xl font-bold text-mahogany">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-rose-gold" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-mahogany">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-rose-gold" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-mahogany">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-rose-gold" />
                </div>
              </div>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Pending Orders</h3>
                    <p className="text-yellow-700">{stats.pendingOrders} orders need attention</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                    <p className="text-red-700">{stats.lowStockProducts} products running low</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-mahogany mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Order #</th>
                      <th className="text-left py-2">Customer</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2">{order.order_number}</td>
                        <td className="py-2">{order.shipping_address?.full_name || 'N/A'}</td>
                        <td className="py-2">₹{order.total_amount.toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-mahogany">Products Management</h2>
              <button
                className="flex items-center gap-2 bg-rose-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', original_price: '', category: '', size: '', color: '', material: '', care_instructions: '', stock_quantity: '', is_featured: false, description: '', images: [] }); setProductModalOpen(true); }}
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-5 h-5" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6">Product</th>
                      <th className="text-left py-3 px-6">Category</th>
                      <th className="text-left py-3 px-6">Price</th>
                      <th className="text-left py-3 px-6">Stock</th>
                      <th className="text-left py-3 px-6">Status</th>
                      <th className="text-left py-3 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-mahogany">{product.name}</div>
                        </td>
                        <td className="py-4 px-6 capitalize">{product.category}</td>
                        <td className="py-4 px-6">₹{product.price.toLocaleString()}</td>
                        <td className="py-4 px-6">
                          <span className={`${product.stock_quantity < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.is_featured ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.is_featured ? 'Featured' : 'Regular'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-gray-600 hover:text-blue-600" onClick={() => setViewProduct(product)}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-600 hover:text-green-600"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductForm({
                                  name: product.name,
                                  price: product.price.toString(),
                                  original_price: product.original_price.toString(),
                                  category: product.category,
                                  size: product.size.join(','),
                                  color: product.color,
                                  material: product.material,
                                  care_instructions: product.care_instructions,
                                  stock_quantity: product.stock_quantity.toString(),
                                  is_featured: product.is_featured,
                                  description: product.description || '',
                                  images: product.images || [],
                                });
                                setProductModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="p-1 text-gray-600 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <AdminOrders />
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-mahogany">Users Management</h2>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Phone</th>
                    <th className="text-left py-2">Gender</th>
                    <th className="text-left py-2">Admin</th>
                    <th className="text-left py-2">Profile Status</th>
                    <th className="text-left py-2">Joined</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium">{user.full_name || 'N/A'}</td>
                      <td className="py-2">{user.email || 'N/A'}</td>
                      <td className="py-2">{user.phone || 'N/A'}</td>
                      <td className="py-2 capitalize">{user.gender || 'N/A'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.profile_status === 'Profile Complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.profile_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-2">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2">
                        <button
                          className="px-2 py-1 text-blue-600 hover:underline"
                          onClick={() => { setSelectedUser(user); setUserModalOpen(true); }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* User Detail Modal */}
              {userModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-10"
                      onClick={() => setUserModalOpen(false)}
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-mahogany">User Details</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-mahogany mb-3">Basic Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="text-gray-900">{selectedUser.full_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-900">{selectedUser.email || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="text-gray-900">{selectedUser.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-mahogany mb-3">Additional Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Gender:</span>
                            <span className="text-gray-900 capitalize">{selectedUser.gender || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Date of Birth:</span>
                            <span className="text-gray-900">{selectedUser.date_of_birth || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Admin Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              selectedUser.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedUser.is_admin ? 'Admin' : 'User'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Profile Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              selectedUser.profile_status === 'Profile Complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedUser.profile_status || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Joined:</span>
                            <span className="text-gray-900">
                              {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setUserModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-10"
              onClick={() => setProductModalOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-mahogany text-center">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              {productFormError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                  {productFormError}
                </div>
              )}
            </div>

            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                
                if (!productForm.name || !productForm.price || !productForm.original_price || !productForm.category || !productForm.size || !productForm.color || !productForm.material || !productForm.care_instructions || !productForm.stock_quantity || productForm.images.length === 0) {
                  setProductFormError('Please fill all required fields and upload an image.');
                  return;
                }
                setProductFormError('');
                
                try {
                  const productData = {
                      name: productForm.name,
                      price: Number(productForm.price),
                    original_price: Number(productForm.original_price),
                      category: productForm.category,
                    size: productForm.size.split(',').map(s => s.trim()).filter(Boolean),
                    color: productForm.color,
                    material: productForm.material,
                    care_instructions: productForm.care_instructions,
                      stock_quantity: Number(productForm.stock_quantity),
                      is_featured: productForm.is_featured,
                      description: productForm.description,
                      images: productForm.images,
                      updated_at: new Date().toISOString(),
                  };
                  
                  if (editingProduct) {
                    const { data, error } = await supabase
                      .from('products')
                      .update(productData)
                      .eq('id', editingProduct.id)
                      .select();
                    
                    if (error) {
                      throw error;
                    }
                  } else {
                    const { data, error } = await supabase
                      .from('products')
                      .insert({
                        ...productData,
                      created_at: new Date().toISOString(),
                      })
                      .select();
                    
                    if (error) {
                      throw error;
                    }
                  }
                  
                  setProductModalOpen(false);
                  setProductForm({ name: '', price: '', original_price: '', category: '', size: '', color: '', material: '', care_instructions: '', stock_quantity: '', is_featured: false, description: '', images: [] });
                  setProductFormError('');
                  await fetchDashboardData();
                  alert('Product saved successfully!');
                } catch (error) {
                  setProductFormError(`Error saving product: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
              }}
            >
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-mahogany mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.name} 
                      onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} 
                      required 
                      placeholder="Enter product name"
                    />
              </div>
                  
                <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.category} 
                      onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} 
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="party">Party</option>
                      <option value="festive">Festive</option>
                    </select>
                </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-mahogany mb-4">Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.price} 
                      onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} 
                      required 
                      placeholder="0"
                      min="0"
                    />
                </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Original Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.original_price} 
                      onChange={e => setProductForm(f => ({ ...f, original_price: e.target.value }))} 
                      required 
                      placeholder="0"
                      min="0"
                    />
              </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-mahogany mb-4">Product Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.color} 
                      onChange={e => setProductForm(f => ({ ...f, color: e.target.value }))} 
                      required 
                      placeholder="e.g., Red, Blue, Green"
                    />
              </div>
                  
              <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Material <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.material} 
                      onChange={e => setProductForm(f => ({ ...f, material: e.target.value }))} 
                      required 
                      placeholder="e.g., Cotton, Silk, Polyester"
                    />
              </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Available Sizes <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.size} 
                      onChange={e => setProductForm(f => ({ ...f, size: e.target.value }))} 
                      required 
                      placeholder="S, M, L, XL (comma separated)"
                    />
              </div>
                  
              <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                      value={productForm.stock_quantity} 
                      onChange={e => setProductForm(f => ({ ...f, stock_quantity: e.target.value }))} 
                      required 
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block mb-2 font-medium text-gray-700">
                    Care Instructions <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                    value={productForm.care_instructions} 
                    onChange={e => setProductForm(f => ({ ...f, care_instructions: e.target.value }))} 
                    required 
                    placeholder="e.g., Hand wash cold, Do not bleach"
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-mahogany mb-4">Description</h4>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Product Description
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent" 
                    value={productForm.description} 
                    onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} 
                    rows={4}
                    placeholder="Enter detailed product description..."
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-mahogany mb-4">Product Images</h4>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Product Images <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={e => handleProductImageUpload(e.target.files)} 
                    required={productForm.images.length === 0}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    You can select multiple images. Maximum file size: 5MB per image.
                  </p>
                  
                  {/* Image Preview Grid */}
                {productForm.images.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-3">Uploaded Images ({productForm.images.length})</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {productForm.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`Product ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
              </div>

              {/* Settings Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-mahogany mb-4">Settings</h4>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={productForm.is_featured} 
                    onChange={e => setProductForm(f => ({ ...f, is_featured: e.target.checked }))} 
                    id="featured" 
                    className="w-4 h-4 text-rose-gold focus:ring-rose-gold border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="font-medium text-gray-700">
                    Mark as Featured Product
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-rose-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-gold focus:ring-offset-2"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button 
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-10"
              onClick={() => setViewProduct(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-mahogany">Product Details</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images Gallery */}
              <div className="space-y-4">
                {viewProduct.images && viewProduct.images.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div className="relative">
                      <img 
                        src={viewProduct.images[0]} 
                        alt={viewProduct.name} 
                        className="w-full h-96 object-cover rounded-lg border"
                      />
                      {viewProduct.images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          {viewProduct.images.length} images
                        </div>
                      )}
          </div>
                    
                    {/* Thumbnail Gallery */}
                    {viewProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {viewProduct.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`${viewProduct.name} ${index + 1}`} 
                            className="w-full h-20 object-cover rounded border cursor-pointer hover:border-rose-gold transition-colors"
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No images available</span>
                  </div>
                )}
              </div>
              
              {/* Product Information */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-mahogany mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="text-gray-900">{viewProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="text-gray-900 capitalize">{viewProduct.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="text-gray-900">₹{viewProduct.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Original Price:</span>
                      <span className="text-gray-900">₹{viewProduct.original_price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-mahogany mb-3">Product Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Stock:</span>
                      <span className={`${viewProduct.stock_quantity < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {viewProduct.stock_quantity} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Color:</span>
                      <span className="text-gray-900 capitalize">{viewProduct.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Material:</span>
                      <span className="text-gray-900 capitalize">{viewProduct.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Sizes:</span>
                      <span className="text-gray-900">{viewProduct.size.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Featured:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        viewProduct.is_featured ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewProduct.is_featured ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {viewProduct.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-mahogany mb-3">Description</h4>
                    <p className="text-gray-700">{viewProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;