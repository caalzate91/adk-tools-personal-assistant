import type { ToolResultContent } from '@/types/message';
import './ToolResultWidget.css';

interface ToolResultWidgetProps {
  content: ToolResultContent;
}

function ExchangeRateView({ content }: { content: ToolResultContent }) {
  const { from, to, rate } = content.payload as { from?: string; to?: string; rate?: number };
  return (
    <div className="tool-result tool-result--exchange_rate">
      <div className="tool-result__currencies">
        {from && <span className="tool-result__currency-code">{String(from)}</span>}
        <span>→</span>
        {to && <span className="tool-result__currency-code">{String(to)}</span>}
      </div>
      {rate != null && <div className="tool-result__rate">{String(rate)}</div>}
      <p className="tool-result__summary">{content.summary}</p>
    </div>
  );
}

function WikipediaView({ content }: { content: ToolResultContent }) {
  return (
    <div className="tool-result tool-result--wikipedia">
      <p className="tool-result__summary">{content.summary}</p>
    </div>
  );
}

function SearchView({ content }: { content: ToolResultContent }) {
  return (
    <div className="tool-result tool-result--search">
      <p className="tool-result__summary">{content.summary}</p>
    </div>
  );
}

function UnknownView({ content }: { content: ToolResultContent }) {
  return (
    <div className="tool-result tool-result--unknown">
      <p className="tool-result__summary">{content.summary}</p>
    </div>
  );
}

export function ToolResultWidget({ content }: ToolResultWidgetProps) {
  switch (content.toolType) {
    case 'exchange_rate':
      return <ExchangeRateView content={content} />;
    case 'wikipedia':
      return <WikipediaView content={content} />;
    case 'search':
      return <SearchView content={content} />;
    default:
      return <UnknownView content={content} />;
  }
}
