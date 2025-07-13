import React, { useState } from 'react';
import { Plus, MapPin, Edit, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import AddressForm from './AddressForm';

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

interface ShippingFormProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  onAddressesUpdate: () => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  addresses,
  selectedAddress,
  onAddressSelect,
  onAddressesUpdate
}) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { user } = useAuth();

  const handleAddressSubmit = async (addressData: any) => {
    if (!user) return;

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            ...addressData,
            user_id: user.id,
            type: 'shipping'
          });

        if (error) throw error;
      }

      setShowAddressForm(false);
      setEditingAddress(null);
      onAddressesUpdate();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      onAddressesUpdate();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  if (showAddressForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mahogany">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button
            onClick={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleAddressSubmit}
          onCancel={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-mahogany">Shipping Address</h2>
        <button
          onClick={() => setShowAddressForm(true)}
          className="flex items-center gap-2 text-rose-gold hover:text-rose-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
          <p className="text-gray-600 mb-4">Add a shipping address to continue</p>
          <button
            onClick={() => setShowAddressForm(true)}
            className="bg-rose-gold text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedAddress?.id === address.id
                  ? 'border-rose-gold bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-mahogany">{address.full_name}</h3>
                    {address.is_default && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                    {selectedAddress?.id === address.id && (
                      <Check className="w-5 h-5 text-rose-gold" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">{address.phone}</p>
                  <p className="text-gray-700">
                    {address.address_line_1}
                    {address.address_line_2 && `, ${address.address_line_2}`}
                  </p>
                  <p className="text-gray-700">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-gray-700">{address.country}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address);
                      setShowAddressForm(true);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!address.is_default && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      className="text-xs text-rose-gold hover:text-rose-800 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAddress && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              Selected shipping address: {selectedAddress.full_name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingForm;