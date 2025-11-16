import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FleetMemberList } from './FleetMemberList';

describe('FleetMemberList', () => {
  const mockOnMemberRemoved = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('displays message when no fleet members', () => {
    render(
      <FleetMemberList
        members={[]}
        onMemberRemoved={mockOnMemberRemoved}
      />
    );

    expect(screen.getByText(/No fleet members yet/)).toBeInTheDocument();
  });

  it('displays list of fleet members', () => {
    const mockMembers = [
      {
        id: '1',
        driverId: 'd1',
        driverEmail: 'driver1@test.com',
        driverName: 'Driver One',
        joinedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: '2',
        driverId: 'd2',
        driverEmail: 'driver2@test.com',
        driverName: 'Driver Two',
        joinedAt: new Date('2025-01-15').toISOString(),
      },
    ];

    render(
      <FleetMemberList
        members={mockMembers}
        onMemberRemoved={mockOnMemberRemoved}
      />
    );

    expect(screen.getByText('Driver One')).toBeInTheDocument();
    expect(screen.getByText('driver1@test.com')).toBeInTheDocument();
    expect(screen.getByText('Driver Two')).toBeInTheDocument();
    expect(screen.getByText('driver2@test.com')).toBeInTheDocument();
  });

  it('shows confirmation modal before removing member', async () => {
    const mockMembers = [
      {
        id: '1',
        driverId: 'd1',
        driverEmail: 'driver1@test.com',
        driverName: 'Driver One',
        joinedAt: new Date().toISOString(),
      },
    ];

    render(
      <FleetMemberList
        members={mockMembers}
        onMemberRemoved={mockOnMemberRemoved}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();
      expect(screen.getByText('Remove Fleet Member')).toBeInTheDocument();
    });
  });

  it('removes fleet member successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Fleet member removed successfully' }),
    });

    const mockMembers = [
      {
        id: '1',
        driverId: 'd1',
        driverEmail: 'driver1@test.com',
        driverName: 'Driver One',
        joinedAt: new Date().toISOString(),
      },
    ];

    render(
      <FleetMemberList
        members={mockMembers}
        onMemberRemoved={mockOnMemberRemoved}
      />
    );

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to remove/)).toBeInTheDocument();
    });

    // Get all buttons with "Remove" text and click the last one (modal confirm button)
    const allRemoveButtons = screen.getAllByText('Remove');
    fireEvent.click(allRemoveButtons[allRemoveButtons.length - 1]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/fleet/members?driverId=d1', {
        method: 'DELETE',
      });
      expect(mockOnMemberRemoved).toHaveBeenCalled();
    });
  });
});
