import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface AddressFormData {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressFormProps {
  initialData?: any;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<AddressFormData>({
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    address_line_1: initialData?.address_line_1 || '',
    address_line_2: initialData?.address_line_2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'India',
    is_default: initialData?.is_default || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.postal_code)) {
      newErrors.postal_code = 'Please enter a valid 6-digit postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-mahogany mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent ${
              errors.full_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-mahogany mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your phone number"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* Address Line 1 */}
      <div>
        <label htmlFor="address_line_1" className="block text-sm font-medium text-mahogany mb-2">
          Address Line 1 *
        </label>
        <input
          type="text"
          id="address_line_1"
          name="address_line_1"
          value={formData.address_line_1}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent ${
            errors.address_line_1 ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="House number, street name"
        />
        {errors.address_line_1 && <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>}
      </div>

      {/* Address Line 2 */}
      <div>
        <label htmlFor="address_line_2" className="block text-sm font-medium text-mahogany mb-2">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          id="address_line_2"
          name="address_line_2"
          value={formData.address_line_2}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent"
          placeholder="Apartment, suite, landmark"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-mahogany mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter city"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-mahogany mb-2">
            State *
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select State</option>
            {indianStates.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-mahogany mb-2">
            Postal Code *
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-transparent ${
              errors.postal_code ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter postal code"
            maxLength={6}
          />
          {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
        </div>
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-mahogany mb-2">
          Country
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
          readOnly
        />
      </div>

      {/* Default Address */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_default"
          name="is_default"
          checked={formData.is_default}
          onChange={handleInputChange}
          className="h-4 w-4 text-rose-gold focus:ring-rose-gold border-gray-300 rounded"
        />
        <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          className="flex items-center gap-2 bg-rose-gold text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Save className="w-5 h-5" />
          Save Address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;