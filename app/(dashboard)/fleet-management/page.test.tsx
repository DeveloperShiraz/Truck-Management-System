import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FleetManagementPage from './page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fleet components
vi.mock('@/components/fleet/FleetCodeGenerator', () => ({
  FleetCodeGenerator: ({ activeCode, onCodeGenerated, onCodeDeleted }: any) => (
    <div data-testid="fleet-code-generator">
      <div>Fleet Code Generator</div>
      {activeCode && <div data-testid="active-code">{activeCode.code}</div>}
      <button onClick={onCodeGenerated}>Generate</button>
      <button onClick={onCodeDeleted}>Delete</button>
    </div>
  ),
}));

vi.mock('@/components/fleet/FleetMemberList', () => ({
  FleetMemberList: ({ members, onMemberRemoved }: any) => (
    <div data-testid="fleet-member-list">
      <div>Fleet Members: {members.length}</div>
      <button onClick={onMemberRemoved}>Remove Member</button>
    </div>
  ),
}));

describe('FleetManagementPage', () => {
  const mockPush = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    global.fetch = mockFetch;
  });

  it('redirects to login if not authenticated', () => {
    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<FleetManagementPage />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('redirects to profile if user is not a truck owner', () => {
    (useSession as any).mockReturnValue({
      data: {
        user: { id: '1', email: 'driver@test.com', role: 'driver', name: 'Driver' },
      },
      status: 'authenticated',
    });

    render(<FleetManagementPage />);

    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('renders fleet management interface for truck owners', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: { id: '1', email: 'owner@test.com', role: 'owner', name: 'Owner' },
      },
      status: 'authenticated',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    });

    render(<FleetManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Fleet Management')).toBeInTheDocument();
      expect(screen.getByTestId('fleet-code-generator')).toBeInTheDocument();
      expect(screen.getByTestId('fleet-member-list')).toBeInTheDocument();
    });
  });

  it('displays active fleet code when available', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: { id: '1', email: 'owner@test.com', role: 'owner', name: 'Owner' },
      },
      status: 'authenticated',
    });

    const mockCode = {
      code: 'ABC12345',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: mockCode }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    });

    render(<FleetManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('active-code')).toHaveTextContent('ABC12345');
    });
  });

  it('displays fleet members when available', async () => {
    (useSession as any).mockReturnValue({
      data: {
        user: { id: '1', email: 'owner@test.com', role: 'owner', name: 'Owner' },
      },
      status: 'authenticated',
    });

    const mockMembers = [
      {
        id: '1',
        driverId: 'd1',
        driverEmail: 'driver1@test.com',
        driverName: 'Driver One',
        joinedAt: new Date().toISOString(),
      },
      {
        id: '2',
        driverId: 'd2',
        driverEmail: 'driver2@test.com',
        driverName: 'Driver Two',
        joinedAt: new Date().toISOString(),
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });

    render(<FleetManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Fleet Members: 2')).toBeInTheDocument();
    });
  });
});
