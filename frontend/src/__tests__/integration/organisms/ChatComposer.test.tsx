import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatComposer } from '@/organisms/ChatComposer/ChatComposer';

const mockSendMessage = vi.fn();
const mockClearError = vi.fn();

vi.mock('@/hooks/useConversation', () => ({
  useConversation: () => ({
    messages: [],
    status: 'idle',
    errorMessage: null,
    sendMessage: mockSendMessage,
    initSession: vi.fn(),
    loadHistory: vi.fn(),
    clearError: mockClearError,
  }),
}));

describe('ChatComposer', () => {
  it('dispatches message via onSend prop', async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn();
    render(<ChatComposer onSend={handleSend} status="idle" errorMessage={null} onClearError={() => {}} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello agent{Enter}');
    expect(handleSend).toHaveBeenCalledWith('Hello agent');
  });

  it('shows LoadingDots when status is streaming', () => {
    render(<ChatComposer onSend={() => {}} status="streaming" errorMessage={null} onClearError={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disables input while status is sending or streaming', () => {
    render(<ChatComposer onSend={() => {}} status="sending" errorMessage={null} onClearError={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('clears input after sending a message', async () => {
    const user = userEvent.setup();
    render(<ChatComposer onSend={() => {}} status="idle" errorMessage={null} onClearError={() => {}} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test{Enter}');
    expect(input).toHaveValue('');
  });

  it('shows ErrorBanner when errorMessage is present', () => {
    render(<ChatComposer onSend={() => {}} status="error" errorMessage="Network error" onClearError={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
  });

  it('does not show LoadingDots when status is idle', () => {
    render(<ChatComposer onSend={() => {}} status="idle" errorMessage={null} onClearError={() => {}} />);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
