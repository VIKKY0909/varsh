import React, { useState, useEffect } from 'react';
import { User, MapPin, CreditCard, Bell, Shield, Camera, Edit, Save, X, Package, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  profile_picture_url: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: ''
  });

  const { user } = useAuth();

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'My Orders', icon: Package },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile(data);
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      // Handle error silently
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="bg-gray-200 h-64 rounded-lg"></div>
              <div className="lg:col-span-3 bg-gray-200 h-96 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mahogany">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your profile and account settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Summary */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-20 h-20 bg-rose-gold rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <h3 className="font-semibold text-mahogany mt-3">
                  {profile?.full_name || 'User'}
                </h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-rose-50 text-rose-gold border border-rose-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-mahogany">Profile Information</h2>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2 bg-rose-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              full_name: profile?.full_name || '',
                              phone: profile?.phone || '',
                              date_of_birth: profile?.date_of_birth || '',
                              gender: profile?.gender || ''
                            });
                          }}
                          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-mahogany mb-2">
                        Full Name
                      </label>
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {profile?.full_name || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mahogany mb-2">
                        Email Address
                      </label>
                      <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600">
                        {user?.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mahogany mb-2">
                        Phone Number
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg">
                          {profile?.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mahogany mb-2">
                        Date of Birth
                      </label>
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mahogany mb-2">
                        Gender
                      </label>
                      <p className="px-4 py-3 bg-gray-50 rounded-lg capitalize">
                        {profile?.gender || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-mahogany mb-2">
                        Member Since
                      </label>
                      <p className="px-4 py-3 bg-gray-50 rounded-lg">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-mahogany mb-6">Recent Orders</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-mahogany">Order #{order.order_number}</h3>
                              <p className="text-gray-600 text-sm">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-rose-gold">₹{order.total_amount.toLocaleString()}</p>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <a
                          href="/orders"
                          className="text-rose-gold hover:text-rose-800 font-medium"
                        >
                          View All Orders →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-2xl font-bold text-mahogany mb-6">Saved Addresses</h2>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No addresses saved</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-mahogany">{address.full_name}</h3>
                                {address.is_default && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                              </p>
                              <p className="text-gray-700">
                                {address.city}, {address.state} {address.postal_code}
                              </p>
                              <p className="text-gray-600 text-sm">{address.phone}</p>
                            </div>
                            <button className="text-rose-gold hover:text-rose-800">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-mahogany mb-6">My Wishlist</h2>
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">View your saved items</p>
                    <a
                      href="/wishlist"
                      className="text-rose-gold hover:text-rose-800 font-medium"
                    >
                      Go to Wishlist →
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-mahogany mb-6">Notification Preferences</h2>
                  <p className="text-gray-600">Manage your notification settings</p>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-mahogany mb-6">Security Settings</h2>
                  <p className="text-gray-600">Manage your account security</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;