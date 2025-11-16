import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './page';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock the hooks
vi.mock('@/hooks/useAuth');
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProfilePage', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  };

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'driver' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useAuth as any).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
    });
  });

  it('displays current user information', () => {
    render(<ProfilePage />);
    
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    
    const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
    expect(roleSelect.value).toBe('driver');
  });

  it('shows loading state when user data is loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      logout: vi.fn(),
    });

    render(<ProfilePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ProfilePage />);
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ProfilePage />);
    
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  it('shows confirmation modal when role is changed', async () => {
    render(<ProfilePage />);
    
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'owner' } });

    await waitFor(() => {
      expect(screen.getByText('Confirm Role Change')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to change your role/)).toBeInTheDocument();
    });
  });

  it('shows warning when switching from driver to owner', async () => {
    render(<ProfilePage />);
    
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'owner' } });

    await waitFor(() => {
      expect(screen.getByText(/Switching to Truck Owner will remove you from your current fleet/)).toBeInTheDocument();
    });
  });

  it('shows warning when switching from owner to driver', async () => {
    (useAuth as any).mockReturnValue({
      user: { ...mockUser, role: 'owner' },
      isLoading: false,
      isAuthenticated: true,
      logout: vi.fn(),
    });

    render(<ProfilePage />);
    
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'driver' } });

    await waitFor(() => {
      expect(screen.getByText(/Switching to Driver will invalidate your active fleet code/)).toBeInTheDocument();
    });
  });

  it('cancels role change when cancel button is clicked', async () => {
    render(<ProfilePage />);
    
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'owner' } });

    await waitFor(() => {
      expect(screen.getByText('Confirm Role Change')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Role Change')).not.toBeInTheDocument();
    });
  });

  it('confirms role change when confirm button is clicked', async () => {
    render(<ProfilePage />);
    
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'owner' } });

    await waitFor(() => {
      expect(screen.getByText('Confirm Role Change')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Change');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('Confirm Role Change')).not.toBeInTheDocument();
    });
  });

  it('successfully updates profile', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Profile updated successfully',
        user: { ...mockUser, name: 'Updated Name' },
      }),
    });

    render(<ProfilePage />);
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'driver',
      }),
    });
  });

  it('refreshes page after role change', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Profile updated successfully',
        user: { ...mockUser, role: 'owner' },
      }),
    });

    render(<ProfilePage />);
    
    // Change role
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'owner' } });

    // Confirm role change
    await waitFor(() => {
      expect(screen.getByText('Confirm Role Change')).toBeInTheDocument();
    });
    const confirmButton = screen.getByText('Confirm Change');
    fireEvent.click(confirmButton);

    // Submit form
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    // Wait for the timeout to trigger refresh
    await waitFor(() => {
      expect(mockRouter.refresh).toHaveBeenCalled();
    }, { timeout: 1500 });
  });

  it('displays error message on update failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Email is already in use',
      }),
    });

    render(<ProfilePage />);
    
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is already in use')).toBeInTheDocument();
    });
  });
});
