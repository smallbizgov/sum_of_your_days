import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    // Test passes if no error is thrown
  });

  it('renders a spinner element', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('generic'); // div elements don't have specific roles
    expect(spinner).toBeInTheDocument();
  });

  it('has correct container classes', () => {
    render(<LoadingSpinner />);

    const container = screen.getByRole('generic');
    expect(container).toHaveClass('flex', 'justify-center', 'items-center', 'p-4');
  });

  it('has correct spinner classes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('generic').firstElementChild;
    expect(spinner).toHaveClass(
      'animate-spin',
      'rounded-full',
      'h-8',
      'w-8',
      'border-b-2',
      'border-cyan-400'
    );
  });

  it('spinner is a div element', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('generic').firstElementChild;
    expect(spinner.tagName).toBe('DIV');
  });

  it('renders only one spinner element', () => {
    render(<LoadingSpinner />);

    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners).toHaveLength(1);
  });
});