import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ServicePage from '../page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ServicePage', () => {
  const mockPush = vi.fn();
  const mockUseRouter = useRouter as ReturnType<typeof vi.fn>;
  const mockUseSession = useSession as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });
  });

  describe('Access Control', () => {
    it('redirects to login when user is not authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<ServicePage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('allows access for truck owners', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'owner1',
            email: 'owner@example.com',
            role: 'owner',
          },
        },
        status: 'authenticated',
      });

      render(<ServicePage />);

      await waitFor(() => {
        expect(screen.getByText('Service & Maintenance')).toBeInTheDocument();
      });
    });

    it('allows access for drivers with fleet membership', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'driver1',
            email: 'driver@example.com',
            role: 'driver',
            fleetOwnerId: 'owner1',
          },
        },
        status: 'authenticated',
      });

      render(<ServicePage />);

      await waitFor(() => {
        expect(screen.getByText('Service & Maintenance')).toBeInTheDocument();
      });
    });

    it('redirects drivers without fleet to profile page', async () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'driver1',
            email: 'driver@example.com',
            role: 'driver',
            fleetOwnerId: null,
          },
        },
        status: 'authenticated',
      });

      render(<ServicePage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile');
      });
    });

    it('shows loading state while session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<ServicePage />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Page Content', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'owner1',
            email: 'owner@example.com',
            role: 'owner',
          },
        },
        status: 'authenticated',
      });
    });

    it('displays AWS integration information banner', async () => {
      render(<ServicePage />);

      await waitFor(() => {
        expect(screen.getByText('Future AWS Integration')).toBeInTheDocument();
        expect(screen.getByText(/This page displays mock service and maintenance data/)).toBeInTheDocument();
      });
    });

    it('displays upcoming maintenance section', async () => {
      render(<ServicePage />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Maintenance')).toBeInTheDocument();
        expect(screen.getByText('Annual Inspection')).toBeInTheDocument();
      });
    });

    it('displays service history section', async () => {
      render(<ServicePage />);

      await waitFor(() => {
        expect(screen.getByText('Service History')).toBeInTheDocument();
        expect(screen.getByText('Regular oil and filter change')).toBeInTheDocument();
        expect(screen.getByText('Brake Inspection')).toBeInTheDocument();
      });
    });

    it('displays maintenance summary cards', async () => {
      render(<ServicePage />);

      await waitFor(() => {
        expect(screen.getByText('Total Service Cost')).toBeInTheDocument();
        expect(screen.getByText('Services Completed')).toBeInTheDocument();
        expect(screen.getByText('Next Service')).toBeInTheDocument();
      });
    });
  });
});
