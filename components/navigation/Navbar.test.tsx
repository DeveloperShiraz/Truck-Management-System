import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './Navbar';
import * as useAuthModule from '@/hooks/useAuth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/profile'),
}));

// Mock useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('Navbar', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when user is not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: mockLogout,
    });

    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeNull();
  });

  it('displays all tabs for Truck Owner role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        email: 'owner@test.com',
        name: 'Test Owner',
        role: 'owner',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Fleet Management')).toBeInTheDocument();
    expect(screen.getByText('Telemetrics')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Driver Checklist')).toBeInTheDocument();
  });

  it('hides Fleet Management tab for Driver role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '2',
        email: 'driver@test.com',
        name: 'Test Driver',
        role: 'driver',
        fleetOwnerId: 'owner1',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.queryByText('Fleet Management')).not.toBeInTheDocument();
    expect(screen.getByText('Telemetrics')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Driver Checklist')).toBeInTheDocument();
  });

  it('hides fleet-required tabs for Driver without fleet', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '3',
        email: 'driver2@test.com',
        name: 'Test Driver 2',
        role: 'driver',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.queryByText('Fleet Management')).not.toBeInTheDocument();
    expect(screen.queryByText('Telemetrics')).not.toBeInTheDocument();
    expect(screen.queryByText('Service')).not.toBeInTheDocument();
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.queryByText('Driver Checklist')).not.toBeInTheDocument();
  });

  it('highlights active tab', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        email: 'owner@test.com',
        name: 'Test Owner',
        role: 'owner',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    // The mock returns '/profile' by default, so Profile should be highlighted
    const profileLink = screen.getByText('Profile').closest('a');
    expect(profileLink).toHaveClass('border-blue-500');
  });

  it('calls logout when logout button is clicked', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        email: 'owner@test.com',
        name: 'Test Owner',
        role: 'owner',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('displays user name and role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        email: 'owner@test.com',
        name: 'Test Owner',
        role: 'owner',
      },
      isLoading: false,
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);

    expect(screen.getByText('Test Owner (owner)')).toBeInTheDocument();
  });
});
