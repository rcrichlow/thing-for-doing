import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkingMemoryView from '../pages/working-memory/WorkingMemoryView';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  getWorkingMemoryEntries: vi.fn(),
  createWorkingMemoryEntry: vi.fn(),
}));

describe('WorkingMemoryView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getWorkingMemoryEntries.mockResolvedValue([]);
  });

  it('keeps the composer hidden until opened', async () => {
    render(<WorkingMemoryView />);

    expect(await screen.findByText('Working Memory')).toBeInTheDocument();
    expect(screen.queryByTestId('working-memory-modal-input')).not.toBeInTheDocument();
  });

  it('opens the modal on keydown and closes it with backdrop click and Escape', async () => {
    render(<WorkingMemoryView />);
    await screen.findByText('Working Memory');

    fireEvent.keyDown(window, { key: 'a' });

    const input = await screen.findByTestId('working-memory-modal-input');
    fireEvent.change(input, { target: { value: 'Draft entry' } });

    fireEvent.click(input);
    expect(screen.getByTestId('working-memory-modal-input')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('working-memory-modal-backdrop'));
    await waitFor(() => {
      expect(screen.queryByTestId('working-memory-modal-input')).not.toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'b' });
    const reopenedInput = await screen.findByTestId('working-memory-modal-input');
    fireEvent.change(reopenedInput, { target: { value: 'Another draft' } });
    fireEvent.keyDown(reopenedInput, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('working-memory-modal-input')).not.toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'c' });
    expect((await screen.findByTestId('working-memory-modal-input')).value).toBe('');
  });

  it('submits the modal form when Enter is pressed', async () => {
    const createdEntry = {
      id: 42,
      content: 'Remember this',
      updated_at: '2026-03-17T20:00:00.000Z',
    };
    api.createWorkingMemoryEntry.mockResolvedValue(createdEntry);

    render(<WorkingMemoryView />);
    await screen.findByText('Working Memory');

    fireEvent.keyDown(window, { key: 'R' });

    const input = await screen.findByTestId('working-memory-modal-input');
    fireEvent.change(input, { target: { value: 'Remember this' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(api.createWorkingMemoryEntry).toHaveBeenCalledWith({ content: 'Remember this' });
    });

    await waitFor(() => {
      expect(screen.queryByTestId('working-memory-modal-input')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Remember this')).toBeInTheDocument();
  });
});
