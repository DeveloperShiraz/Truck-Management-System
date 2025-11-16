import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChecklistViewer } from './ChecklistViewer';

describe('ChecklistViewer', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('displays loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ChecklistViewer />);
    expect(screen.getByText('Loading checklists...')).toBeInTheDocument();
  });

  it('displays empty state when no checklists available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ checklists: [] }),
    });

    render(<ChecklistViewer />);

    await waitFor(() => {
      expect(screen.getByText(/No checklists available/)).toBeInTheDocument();
    });
  });

  it('displays checklists with completion status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        checklists: [
          {
            id: 'checklist1',
            title: 'Daily Inspection',
            items: [
              { id: 'item1', description: 'Check tires', order: 0 },
              { id: 'item2', description: 'Check oil', order: 1 },
            ],
            completions: {
              item1: true,
              item2: false,
            },
          },
        ],
      }),
    });

    render(<ChecklistViewer />);

    await waitFor(() => {
      expect(screen.getByText('Daily Inspection')).toBeInTheDocument();
      expect(screen.getByText('Check tires')).toBeInTheDocument();
      expect(screen.getByText('Check oil')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('displays progress bar with correct percentage', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        checklists: [
          {
            id: 'checklist1',
            title: 'Test Checklist',
            items: [
              { id: 'item1', description: 'Item 1', order: 0 },
              { id: 'item2', description: 'Item 2', order: 1 },
            ],
            completions: {
              item1: true,
              item2: false,
            },
          },
        ],
      }),
    });

    render(<ChecklistViewer />);

    await waitFor(() => {
      expect(screen.getByText('1 of 2 completed')).toBeInTheDocument();
    });
  });

  it('toggles completion status when checkbox is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          checklists: [
            {
              id: 'checklist1',
              title: 'Test Checklist',
              items: [{ id: 'item1', description: 'Check item', order: 0 }],
              completions: { item1: false },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          completion: {
            id: 'completion1',
            checklistId: 'checklist1',
            itemId: 'item1',
            driverId: 'driver1',
            completed: true,
          },
        }),
      });

    render(<ChecklistViewer />);

    await waitFor(() => {
      expect(screen.getByText('Check item')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/checklist',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('displays completion message when all items are checked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        checklists: [
          {
            id: 'checklist1',
            title: 'Test Checklist',
            items: [
              { id: 'item1', description: 'Item 1', order: 0 },
              { id: 'item2', description: 'Item 2', order: 1 },
            ],
            completions: {
              item1: true,
              item2: true,
            },
          },
        ],
      }),
    });

    render(<ChecklistViewer />);

    await waitFor(() => {
      expect(screen.getByText('✓ Checklist completed!')).toBeInTheDocument();
    });
  });
});
