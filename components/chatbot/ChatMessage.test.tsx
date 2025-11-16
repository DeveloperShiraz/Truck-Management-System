import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';

describe('ChatMessage', () => {
  const mockTimestamp = new Date('2024-01-01T12:00:00');

  it('renders user message with correct styling', () => {
    render(
      <ChatMessage
        role="user"
        content="Hello, this is a user message"
        timestamp={mockTimestamp}
      />
    );

    const message = screen.getByText('Hello, this is a user message');
    expect(message).toBeInTheDocument();
    expect(message.parentElement).toHaveClass('bg-blue-600', 'text-white');
  });

  it('renders assistant message with correct styling', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Hello, this is an assistant message"
        timestamp={mockTimestamp}
      />
    );

    const message = screen.getByText('Hello, this is an assistant message');
    expect(message).toBeInTheDocument();
    expect(message.parentElement).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('displays timestamp', () => {
    render(
      <ChatMessage
        role="user"
        content="Test message"
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(
      <ChatMessage
        role="user"
        content="User message"
        timestamp={mockTimestamp}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('justify-end');
  });

  it('aligns assistant messages to the left', () => {
    const { container } = render(
      <ChatMessage
        role="assistant"
        content="Assistant message"
        timestamp={mockTimestamp}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('justify-start');
  });

  it('handles multi-line content', () => {
    const multiLineContent = 'Line 1\nLine 2\nLine 3';
    render(
      <ChatMessage
        role="user"
        content={multiLineContent}
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
    expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    expect(screen.getByText(/Line 3/)).toBeInTheDocument();
  });
});
