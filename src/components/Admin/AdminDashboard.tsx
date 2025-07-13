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
import { createClient } from '@supabase/supabase-js';
import OrderManagement from './OrderManagement';

const localSupabase = createClient(
  'https://qajswgkrjldtugyymydg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhanN3Z2tyamxkdHVneXlteWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzE1MzksImV4cCI6MjA2NDgwNzUzOX0.lW9pODYsrKOpgVKNE0fRmoK512AjcujV06SEPMN9Ezw'
);

// Ensure the user is authenticated
const { data: { user } } = await localSupabase.auth.getUser();
console.log(user); // Verify the user object

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_featured: boolean;
  created_at: string;
  images: string[]; // Added images property
  description?: string; // Optional, if you want to avoid similar issues with description
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
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
    product: {
      name: string;
    };
  }[];
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  interface User {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    gender?: string;
    date_of_birth?: string;
  }

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
    category: '',
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
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch orders with order items
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            product:products(name)
          )
        `)
        .order('created_at', { ascending: false });

      // Fetch users
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
      const lowStockProducts = productsData?.filter(product => product.stock_quantity < 5).length || 0;
      
      setStats({
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        totalUsers: usersData?.length || 0,
        pendingOrders,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Add tracking entry
      await supabase
        .from('order_tracking')
        .insert({
          order_id: orderId,
          status: `Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `Order status updated to ${newStatus} by admin.`
        });

      // Create notification for user
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            type: 'order',
            title: 'Order Status Updated',
            message: `Your order ${order.order_number} status has been updated to ${newStatus}.`,
            action_url: `/orders`
          });
      }

      // Re-fetch orders from backend to get latest status
      await fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
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
      console.error('Error deleting product:', error);
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
      console.error('Error deleting order:', error);
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
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    try {
      const { error } = await supabase.storage.from('product-images').upload(fileName, file, { upsert: true });
      if (error) {
        setProductFormError('Image upload failed.');
        console.error('Supabase image upload error:', error);
        return;
      }
      // Use public URL for public bucket
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (!publicUrlData || !publicUrlData.publicUrl) {
        setProductFormError('Failed to get public image URL.');
        console.error('Supabase getPublicUrl error: No publicUrl returned');
        return;
      }
      setProductForm(f => ({ ...f, images: [publicUrlData.publicUrl] }));
    } catch (err) {
      setProductFormError('Unexpected error during image upload.');
      console.error('Unexpected image upload error:', err);
    }
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
                onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: '', category: '', stock_quantity: '', is_featured: false, description: '', images: [] }); setProductModalOpen(true); }}
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
                                  category: product.category,
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
          <OrderManagement
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onDeleteOrder={deleteOrder}
          />
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
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-2">{user.full_name || 'N/A'}</td>
                      <td className="py-2">{user.email || 'N/A'}</td>
                      <td className="py-2">{user.phone || 'N/A'}</td>
                      <td className="py-2">
                        <button
                          className="px-2 py-1 text-blue-600 hover:underline"
                          onClick={() => { setSelectedUser(user); setUserModalOpen(true); }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* User Detail Modal */}
              {userModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                      onClick={() => setUserModalOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-bold mb-4">User Details</h3>
                    <div className="mb-2"><b>Name:</b> {selectedUser.full_name || 'N/A'}</div>
                    <div className="mb-2"><b>Email:</b> {selectedUser.email || 'N/A'}</div>
                    <div className="mb-2"><b>Phone:</b> {selectedUser.phone || 'N/A'}</div>
                    <div className="mb-2"><b>Gender:</b> {selectedUser.gender || 'N/A'}</div>
                    <div className="mb-2"><b>Date of Birth:</b> {selectedUser.date_of_birth || 'N/A'}</div>
                    {/* Add more fields as needed */}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setProductModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-mahogany text-center">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            {productFormError && <div className="mb-4 text-red-600 text-center">{productFormError}</div>}
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!productForm.name || !productForm.price || !productForm.category || !productForm.stock_quantity || productForm.images.length === 0) {
                  setProductFormError('Please fill all required fields and upload an image.');
                  return;
                }
                setProductFormError('');
                try {
                  if (editingProduct) {
                    await supabase.from('products').update({
                      name: productForm.name,
                      price: Number(productForm.price),
                      category: productForm.category,
                      stock_quantity: Number(productForm.stock_quantity),
                      is_featured: productForm.is_featured,
                      description: productForm.description,
                      images: productForm.images,
                      updated_at: new Date().toISOString(),
                    }).eq('id', editingProduct.id);
                  } else {
                    await supabase.from('products').insert({
                      name: productForm.name,
                      price: Number(productForm.price),
                      category: productForm.category,
                      stock_quantity: Number(productForm.stock_quantity),
                      is_featured: productForm.is_featured,
                      description: productForm.description,
                      images: productForm.images,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  }
                  setProductModalOpen(false);
                  setProductForm({ name: '', price: '', category: '', stock_quantity: '', is_featured: false, description: '', images: [] });
                  setProductFormError('');
                  fetchDashboardData();
                  alert('Product saved successfully!');
                } catch {
                  setProductFormError('Error saving product.');
                }
              }}
            >
              <div>
                <label className="block mb-1 font-medium">Name<span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Price<span className="text-red-500">*</span></label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Stock Quantity<span className="text-red-500">*</span></label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={productForm.stock_quantity} onChange={e => setProductForm(f => ({ ...f, stock_quantity: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Category<span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea className="w-full border rounded px-3 py-2" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={productForm.is_featured} onChange={e => setProductForm(f => ({ ...f, is_featured: e.target.checked }))} id="featured" />
                <label htmlFor="featured" className="font-medium">Featured Product</label>
              </div>
              <div>
                <label className="block mb-1 font-medium">Product Image<span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" onChange={e => handleProductImageUpload(e.target.files)} required={productForm.images.length === 0} />
                {productForm.images.length > 0 && (
                  <img src={productForm.images[0]} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded border" />
                )}
              </div>
              <button type="submit" className="w-full bg-rose-gold text-white px-4 py-2 rounded font-semibold hover:bg-rose-700 transition-colors">{editingProduct ? 'Update' : 'Add'} Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Product View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setViewProduct(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Product Details</h3>
            <div className="mb-2"><b>Name:</b> {viewProduct.name}</div>
            <div className="mb-2"><b>Category:</b> {viewProduct.category}</div>
            <div className="mb-2"><b>Price:</b> ₹{viewProduct.price}</div>
            <div className="mb-2"><b>Stock:</b> {viewProduct.stock_quantity}</div>
            <div className="mb-2"><b>Featured:</b> {viewProduct.is_featured ? 'Yes' : 'No'}</div>
            {viewProduct.images && viewProduct.images.length > 0 && (
              <img src={viewProduct.images[0]} alt="Product" className="mt-2 w-32 h-32 object-cover rounded" />
            )}
            <div className="mb-2"><b>Description:</b> {viewProduct.description || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;