import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TelemetricsPage from './page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('TelemetricsPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  it('should allow access for truck owners', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'owner@test.com',
          name: 'Test Owner',
          role: 'owner',
        },
      },
      status: 'authenticated',
    });

    render(<TelemetricsPage />);

    await waitFor(() => {
      expect(screen.getByText('Telemetrics')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should allow access for drivers with fleet membership', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          id: '2',
          email: 'driver@test.com',
          name: 'Test Driver',
          role: 'driver',
          fleetOwnerId: 'owner-123',
        },
      },
      status: 'authenticated',
    });

    render(<TelemetricsPage />);

    await waitFor(() => {
      expect(screen.getByText('Telemetrics')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should block access for drivers without fleet membership', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          id: '3',
          email: 'driver-no-fleet@test.com',
          name: 'Test Driver No Fleet',
          role: 'driver',
          fleetOwnerId: undefined,
        },
      },
      status: 'authenticated',
    });

    render(<TelemetricsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('should redirect to login if not authenticated', async () => {
    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<TelemetricsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should display loading state while session is loading', () => {
    (useSession as any).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<TelemetricsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display mock telemetrics data', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'owner@test.com',
          name: 'Test Owner',
          role: 'owner',
        },
      },
      status: 'authenticated',
    });

    render(<TelemetricsPage />);

    await waitFor(() => {
      expect(screen.getByText('Odometer')).toBeInTheDocument();
      expect(screen.getByText('Oil Level')).toBeInTheDocument();
      expect(screen.getByText('Fuel Level')).toBeInTheDocument();
      expect(screen.getByText('Engine Temperature')).toBeInTheDocument();
      expect(screen.getByText('Tire Pressure')).toBeInTheDocument();
    });
  });

  it('should display AWS integration message', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'owner@test.com',
          name: 'Test Owner',
          role: 'owner',
        },
      },
      status: 'authenticated',
    });

    render(<TelemetricsPage />);

    await waitFor(() => {
      expect(screen.getByText('Future AWS Integration')).toBeInTheDocument();
      expect(screen.getByText(/This page displays mock telemetrics data/)).toBeInTheDocument();
    });
  });
});
