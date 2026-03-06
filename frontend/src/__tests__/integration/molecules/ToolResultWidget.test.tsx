import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolResultWidget } from '@/molecules/ToolResultWidget/ToolResultWidget';
import type { ToolResultContent } from '@/types/message';

function makeToolResult(overrides: Partial<ToolResultContent> = {}): ToolResultContent {
  return {
    kind: 'tool_result',
    toolType: 'unknown',
    payload: {},
    summary: 'Summary text',
    ...overrides,
  };
}

describe('ToolResultWidget', () => {
  it('exchange_rate variant shows rate and currency codes', () => {
    const content = makeToolResult({
      toolType: 'exchange_rate',
      payload: { from: 'USD', to: 'EUR', rate: 0.92 },
      summary: '1 USD = 0.92 EUR',
    });
    const { container } = render(<ToolResultWidget content={content} />);
    const codes = container.querySelectorAll('.tool-result__currency-code');
    expect(codes).toHaveLength(2);
    expect(codes[0]).toHaveTextContent('USD');
    expect(codes[1]).toHaveTextContent('EUR');
    expect(container.querySelector('.tool-result__rate')).toHaveTextContent('0.92');
  });

  it('wikipedia variant shows summary prose', () => {
    const content = makeToolResult({
      toolType: 'wikipedia',
      summary: 'Albert Einstein was a theoretical physicist.',
    });
    render(<ToolResultWidget content={content} />);
    expect(screen.getByText(/Albert Einstein/)).toBeInTheDocument();
  });

  it('search variant shows result items', () => {
    const content = makeToolResult({
      toolType: 'search',
      summary: 'Top results for query',
    });
    render(<ToolResultWidget content={content} />);
    expect(screen.getByText(/Top results/)).toBeInTheDocument();
  });

  it('unknown fallback renders summary text', () => {
    const content = makeToolResult({
      toolType: 'unknown',
      summary: 'Fallback summary',
    });
    render(<ToolResultWidget content={content} />);
    expect(screen.getByText('Fallback summary')).toBeInTheDocument();
  });

  it('applies a tool-type-specific CSS class', () => {
    const content = makeToolResult({ toolType: 'exchange_rate' });
    const { container } = render(<ToolResultWidget content={content} />);
    expect(container.querySelector('.tool-result--exchange_rate')).not.toBeNull();
  });
});
