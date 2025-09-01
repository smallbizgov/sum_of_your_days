import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TitleScreen from './TitleScreen';

describe('TitleScreen', () => {
  it('renders the title and subtitle correctly', () => {
    const mockOnBegin = vi.fn();

    render(<TitleScreen onBegin={mockOnBegin} />);

    expect(screen.getByText('The Sum of Your Days')).toBeInTheDocument();
    expect(screen.getByText('Every choice becomes a memory. Every memory defines your story.')).toBeInTheDocument();
  });

  it('renders the Begin button', () => {
    const mockOnBegin = vi.fn();

    render(<TitleScreen onBegin={mockOnBegin} />);

    const beginButton = screen.getByRole('button', { name: /begin/i });
    expect(beginButton).toBeInTheDocument();
  });

  it('calls onBegin when Begin button is clicked', () => {
    const mockOnBegin = vi.fn();

    render(<TitleScreen onBegin={mockOnBegin} />);

    const beginButton = screen.getByRole('button', { name: /begin/i });
    fireEvent.click(beginButton);

    expect(mockOnBegin).toHaveBeenCalledTimes(1);
  });

  it('has correct CSS classes for styling', () => {
    const mockOnBegin = vi.fn();

    render(<TitleScreen onBegin={mockOnBegin} />);

    const container = screen.getByText('The Sum of Your Days').closest('div');
    expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col', 'justify-center', 'items-center');
  });

  it('button has correct styling classes', () => {
    const mockOnBegin = vi.fn();

    render(<TitleScreen onBegin={mockOnBegin} />);

    const beginButton = screen.getByRole('button', { name: /begin/i });
    expect(beginButton).toHaveClass(
      'px-8', 'py-3', 'bg-white/10', 'border', 'border-white/20',
      'text-white', 'font-semibold', 'rounded-lg', 'shadow-lg'
    );
  });

  it('handles multiple clicks on Begin button', () => {
    const mockOnBegin = vi.fn();

    render(<TitleScreen onBegin={mockOnBegin} />);

    const beginButton = screen.getByRole('button', { name: /begin/i });

    fireEvent.click(beginButton);
    fireEvent.click(beginButton);
    fireEvent.click(beginButton);

    expect(mockOnBegin).toHaveBeenCalledTimes(3);
  });
});