import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChecklistManager } from './ChecklistManager';

describe('ChecklistManager', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('displays loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ChecklistManager />);
    expect(screen.getByText('Loading checklists...')).toBeInTheDocument();
  });

  it('displays empty state when no checklists exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ checklists: [] }),
    });

    render(<ChecklistManager />);

    await waitFor(() => {
      expect(screen.getByText('No checklists created yet.')).toBeInTheDocument();
    });
  });

  it('displays list of checklists', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        checklists: [
          {
            id: 'checklist1',
            title: 'Pre-Trip Inspection',
            items: [
              { id: 'item1', description: 'Check tires', order: 0 },
              { id: 'item2', description: 'Check oil', order: 1 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    render(<ChecklistManager />);

    await waitFor(() => {
      expect(screen.getByText('Pre-Trip Inspection')).toBeInTheDocument();
      expect(screen.getByText('Check tires')).toBeInTheDocument();
      expect(screen.getByText('Check oil')).toBeInTheDocument();
    });
  });

  it('opens create modal when create button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ checklists: [] }),
    });

    render(<ChecklistManager />);

    await waitFor(() => {
      expect(screen.getByText('No checklists created yet.')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Your First Checklist');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('creates a new checklist', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ checklists: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          checklist: {
            id: 'new-checklist',
            title: 'New Checklist',
            items: [{ id: 'item1', description: 'Test item', order: 0 }],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          checklists: [
            {
              id: 'new-checklist',
              title: 'New Checklist',
              items: [{ id: 'item1', description: 'Test item', order: 0 }],
            },
          ],
        }),
      });

    render(<ChecklistManager />);

    await waitFor(() => {
      expect(screen.getByText('Create Your First Checklist')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create Your First Checklist');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText('Enter checklist title');
    fireEvent.change(titleInput, { target: { value: 'New Checklist' } });

    const itemInput = screen.getByPlaceholderText('Item 1');
    fireEvent.change(itemInput, { target: { value: 'Test item' } });

    const saveButton = screen.getAllByRole('button').find(btn => btn.textContent === 'Save');
    if (saveButton) fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/checklist',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('shows delete confirmation modal', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        checklists: [
          {
            id: 'checklist1',
            ownerId: 'owner1',
            title: 'Test Checklist',
            items: [{ id: 'item1', description: 'Item 1', order: 0 }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    });

    render(<ChecklistManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Checklist')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });
  });
});
