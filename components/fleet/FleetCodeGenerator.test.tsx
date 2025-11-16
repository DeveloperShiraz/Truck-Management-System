import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FleetCodeGenerator } from './FleetCodeGenerator';

describe('FleetCodeGenerator', () => {
  const mockOnCodeGenerated = vi.fn();
  const mockOnCodeDeleted = vi.fn();
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('displays generate button when no active code', () => {
    render(
      <FleetCodeGenerator
        activeCode={null}
        onCodeGenerated={mockOnCodeGenerated}
        onCodeDeleted={mockOnCodeDeleted}
      />
    );

    expect(screen.getByText('Generate Code To Add Fleet Member')).toBeInTheDocument();
  });

  it('generates fleet code successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 'ABC12345',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      }),
    });

    render(
      <FleetCodeGenerator
        activeCode={null}
        onCodeGenerated={mockOnCodeGenerated}
        onCodeDeleted={mockOnCodeDeleted}
      />
    );

    const generateButton = screen.getByText('Generate Code To Add Fleet Member');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/fleet/generate-code', {
        method: 'POST',
      });
      expect(mockOnCodeGenerated).toHaveBeenCalled();
    });
  });

  it('displays active fleet code with expiration date', () => {
    const mockCode = {
      code: 'ABC12345',
      expiresAt: new Date('2025-12-31').toISOString(),
      createdAt: new Date('2025-12-24').toISOString(),
    };

    render(
      <FleetCodeGenerator
        activeCode={mockCode}
        onCodeGenerated={mockOnCodeGenerated}
        onCodeDeleted={mockOnCodeDeleted}
      />
    );

    expect(screen.getByText('ABC12345')).toBeInTheDocument();
    expect(screen.getByText(/Expires:/)).toBeInTheDocument();
    expect(screen.getByText('Delete Fleet Code')).toBeInTheDocument();
  });

  it('shows confirmation modal before deleting code', async () => {
    const mockCode = {
      code: 'ABC12345',
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    render(
      <FleetCodeGenerator
        activeCode={mockCode}
        onCodeGenerated={mockOnCodeGenerated}
        onCodeDeleted={mockOnCodeDeleted}
      />
    );

    const deleteButton = screen.getByText('Delete Fleet Code');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete this fleet code/)).toBeInTheDocument();
    });
  });

  it('deletes fleet code successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Fleet code deleted successfully' }),
    });

    const mockCode = {
      code: 'ABC12345',
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    render(
      <FleetCodeGenerator
        activeCode={mockCode}
        onCodeGenerated={mockOnCodeGenerated}
        onCodeDeleted={mockOnCodeDeleted}
      />
    );

    const deleteButton = screen.getByText('Delete Fleet Code');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete this fleet code/)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /^Delete$/ });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/fleet/generate-code', {
        method: 'DELETE',
      });
      expect(mockOnCodeDeleted).toHaveBeenCalled();
    });
  });
});
