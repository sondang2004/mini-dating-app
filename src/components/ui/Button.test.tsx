import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me!</Button>);
    expect(
      screen.getByRole('button', { name: /click me!/i })
    ).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    const button = screen.getByRole('button', { name: /clickable/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the primary variant class by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-pink-500');
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveClass('w-full');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });
});
