import '@testing-library/jest-dom';
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { name: 'Test User', phone: '1234567890', email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorDetailsPage from '../VendorDetailsPage';
import { useVendors } from '../../hooks/useVendors';
import { useCart } from '../../contexts/CartContext';

jest.mock('../../hooks/useVendors');
jest.mock('../../contexts/CartContext');
jest.mock('../../utils/api');

const mockVendor = {
  id: 'v1',
  name: 'Test Vendor',
  description: 'Daily food vendor',
  location: 'Coimbatore',
  rating: 4.8,
  image: '',
  deliveryTime: '30 min',
  minimumOrder: 100,
  deliveryFee: 10,
  cuisineType: 'Indian',
  phone: '1234567890',
  isActive: true,
  isFeatured: false,
  created_at: '',
  products: [
    {
      id: 'p1',
      vendor_id: 'v1',
      name: 'Salad Bowl',
      description: 'Fresh salad',
      price: 120,
      category: 'Salads',
      image: '',
      is_available: true,
      is_veg: true,
      created_at: '',
    }
  ]
};

describe('VendorDetailsPage', () => {
  beforeEach(() => {
      (useVendors as jest.Mock).mockReturnValue({
        vendors: [mockVendor],
        loading: false
      });
      (useCart as jest.Mock).mockReturnValue({
        addItem: jest.fn(),
        getItemQuantity: () => 0,
        isItemInCart: () => false
      });
      // Set window.location.pathname directly
      window.location.pathname = '/vendor/v1';
  });

  it('renders vendor details and products', () => {
    render(<VendorDetailsPage vendorId="v1" vendors={[mockVendor]} loading={false} />);
    expect(screen.getByText('Test Vendor')).toBeInTheDocument();
    expect(screen.getByText('Salad Bowl')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('calls addItem when Add to Cart is clicked', () => {
    const addItemMock = jest.fn();
    (useCart as jest.Mock).mockReturnValue({
      addItem: addItemMock,
      getItemQuantity: () => 0,
      isItemInCart: () => false
    });
    render(<VendorDetailsPage vendorId="v1" vendors={[mockVendor]} loading={false} />);
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(addItemMock).toHaveBeenCalledWith(mockVendor.products[0], mockVendor, 1);
  });
});
