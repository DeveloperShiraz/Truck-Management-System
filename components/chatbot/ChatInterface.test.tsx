import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from './ChatInterface';

// Mock fetch
global.fetch = vi.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome message when no messages', () => {
    render(<ChatInterface />);
    expect(screen.getByText('Welcome to TMS Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Ask me anything about the Truck Management System!')).toBeInTheDocument();
  });

  it('displays message input and send button', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends message and displays response', async () => {
    const mockResponse = {
      message: 'Hello! How can I help you?',
      conversationHistory: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    });
  });

  it('displays loading indicator while waiting for response', async () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ message: 'Response', conversationHistory: [] }),
      }), 100))
    );

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const loadingIndicators = screen.getAllByRole('generic').filter(
        el => el.className.includes('animate-bounce')
      );
      expect(loadingIndicators.length).toBeGreaterThan(0);
    });
  });

  it('displays error message with retry button on failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'API Error' }),
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries sending message when retry button is clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'API Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success', conversationHistory: [] }),
      });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(input).toHaveValue('Test message');
  });

  it('disables send button when input is empty', () => {
    render(<ChatInterface />);
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('sends message on Enter key press', async () => {
    const mockResponse = {
      message: 'Response',
      conversationHistory: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(<ChatInterface />);

    const input = screen.getByPlaceholderText(/Type your message/i);

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
