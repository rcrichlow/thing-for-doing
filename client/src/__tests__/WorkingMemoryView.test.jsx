import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkingMemoryView from '../pages/working-memory/WorkingMemoryView';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  getWorkingMemoryEntries: vi.fn(),
  getBoards: vi.fn(),
  createWorkingMemoryEntry: vi.fn(),
  createBoard: vi.fn(),
  createList: vi.fn(),
  createCard: vi.fn(),
  updateWorkingMemoryEntry: vi.fn(),
  deleteWorkingMemoryEntry: vi.fn(),
}));

describe('WorkingMemoryView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getWorkingMemoryEntries.mockResolvedValue([]);
    api.getBoards.mockResolvedValue([]);
  });

  it('keeps the composer hidden until opened', async () => {
    render(<WorkingMemoryView />);

    expect(await screen.findByText('Entries')).toBeInTheDocument();
    expect(screen.queryByTestId('working-memory-modal-input')).not.toBeInTheDocument();
  });

  it('opens the modal on keydown and closes it with backdrop click and Escape', async () => {
    render(<WorkingMemoryView />);
    await screen.findByText('Entries');

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
    await screen.findByText('Entries');

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

  it('promotes the composer to multiline on Shift+Enter and still submits with Enter', async () => {
    const createdEntry = {
      id: 43,
      content: 'Line one\nLine two',
      updated_at: '2026-03-17T20:00:00.000Z',
    };
    api.createWorkingMemoryEntry.mockResolvedValue(createdEntry);

    render(<WorkingMemoryView />);
    await screen.findByText('Entries');

    fireEvent.keyDown(window, { key: 'R' });

    const field = await screen.findByTestId('working-memory-modal-input');
    fireEvent.change(field, { target: { value: 'Line one' } });
    fireEvent.keyDown(field, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    const multilineField = await screen.findByTestId('working-memory-modal-input');
    expect(multilineField.tagName).toBe('TEXTAREA');
    expect(multilineField.value).toBe('Line one\n');

    fireEvent.change(multilineField, { target: { value: 'Line one\nLine two' } });
    fireEvent.keyDown(multilineField, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(api.createWorkingMemoryEntry).toHaveBeenCalledWith({ content: 'Line one\nLine two' });
    });
  });

  it('keeps inserting new lines with repeated Shift+Enter in the composer', async () => {
    render(<WorkingMemoryView />);
    await screen.findByText('Entries');

    fireEvent.keyDown(window, { key: 'R' });

    const field = await screen.findByTestId('working-memory-modal-input');
    fireEvent.change(field, { target: { value: 'Line one' } });
    fireEvent.keyDown(field, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    const multilineField = await screen.findByTestId('working-memory-modal-input');
    fireEvent.keyDown(multilineField, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    await waitFor(() => {
      expect(screen.getByTestId('working-memory-modal-input').value).toBe('Line one\n\n');
      expect(api.createWorkingMemoryEntry).not.toHaveBeenCalled();
    });
  });

  it('deletes an entry after confirmation from the inline delete action', async () => {
    api.getWorkingMemoryEntries.mockResolvedValue([
      {
        id: 7,
        content: 'Delete me',
        updated_at: '2026-03-17T20:00:00.000Z',
      },
    ]);
    api.deleteWorkingMemoryEntry.mockResolvedValue(null);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<WorkingMemoryView />);

    fireEvent.click(await screen.findByTestId('wm-entry-delete-btn-7'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this working memory entry? This action cannot be undone.');
      expect(api.deleteWorkingMemoryEntry).toHaveBeenCalledWith(7);
    });

    await waitFor(() => {
      expect(screen.queryByText('Delete me')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('edits an entry inline when clicked', async () => {
    api.getWorkingMemoryEntries.mockResolvedValue([
      {
        id: 9,
        content: 'Original entry',
        updated_at: '2026-03-17T20:00:00.000Z',
      },
    ]);
    api.updateWorkingMemoryEntry.mockResolvedValue({
      id: 9,
      content: 'Updated entry',
      updated_at: '2026-03-18T20:00:00.000Z',
    });

    render(<WorkingMemoryView />);

    fireEvent.click(await screen.findByTestId('wm-entry-content-btn-9'));

    const input = await screen.findByTestId('wm-entry-input-9');
    fireEvent.change(input, { target: { value: 'Updated entry' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(api.updateWorkingMemoryEntry).toHaveBeenCalledWith(9, { content: 'Updated entry' });
    });

    await waitFor(() => {
      expect(screen.getByText('Updated entry')).toBeInTheDocument();
      expect(screen.queryByTestId('wm-entry-input-9')).not.toBeInTheDocument();
    });
  });

  it('cancels inline editing on Escape', async () => {
    api.getWorkingMemoryEntries.mockResolvedValue([
      {
        id: 10,
        content: 'Keep me',
        updated_at: '2026-03-17T20:00:00.000Z',
      },
    ]);

    render(<WorkingMemoryView />);

    fireEvent.click(await screen.findByTestId('wm-entry-content-btn-10'));

    const input = await screen.findByTestId('wm-entry-input-10');
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(api.updateWorkingMemoryEntry).not.toHaveBeenCalled();
      expect(screen.getByText('Keep me')).toBeInTheDocument();
      expect(screen.queryByTestId('wm-entry-input-10')).not.toBeInTheDocument();
    });
  });

  it('promotes inline editing to multiline on Shift+Enter and still saves with Enter', async () => {
    api.getWorkingMemoryEntries.mockResolvedValue([
      {
        id: 11,
        content: 'Line one',
        updated_at: '2026-03-17T20:00:00.000Z',
      },
    ]);
    api.updateWorkingMemoryEntry.mockResolvedValue({
      id: 11,
      content: 'Line one\nLine two',
      updated_at: '2026-03-18T20:00:00.000Z',
    });

    render(<WorkingMemoryView />);

    fireEvent.click(await screen.findByTestId('wm-entry-content-btn-11'));

    const field = await screen.findByTestId('wm-entry-input-11');
    fireEvent.keyDown(field, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    const multilineField = await screen.findByTestId('wm-entry-input-11');
    expect(multilineField.tagName).toBe('TEXTAREA');
    expect(multilineField.value).toBe('Line one\n');

    fireEvent.change(multilineField, { target: { value: 'Line one\nLine two' } });
    fireEvent.keyDown(multilineField, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(api.updateWorkingMemoryEntry).toHaveBeenCalledWith(11, { content: 'Line one\nLine two' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('wm-entry-content-btn-11')).toHaveTextContent(/Line one\s*Line two/);
      expect(screen.queryByTestId('wm-entry-input-11')).not.toBeInTheDocument();
    });
  });

  it('keeps inserting new lines with repeated Shift+Enter during inline editing', async () => {
    api.getWorkingMemoryEntries.mockResolvedValue([
      {
        id: 12,
        content: 'Line one',
        updated_at: '2026-03-17T20:00:00.000Z',
      },
    ]);

    render(<WorkingMemoryView />);

    fireEvent.click(await screen.findByTestId('wm-entry-content-btn-12'));

    const field = await screen.findByTestId('wm-entry-input-12');
    fireEvent.keyDown(field, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    const multilineField = await screen.findByTestId('wm-entry-input-12');
    fireEvent.keyDown(multilineField, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });

    await waitFor(() => {
      expect(screen.getByTestId('wm-entry-input-12').value).toBe('Line one\n\n');
      expect(api.updateWorkingMemoryEntry).not.toHaveBeenCalled();
    });
  });

  it('preserves line breaks in the send-to-board entry preview', async () => {
    api.getWorkingMemoryEntries.mockResolvedValue([
      {
        id: 13,
        content: 'Line one\nLine two',
        updated_at: '2026-03-17T20:00:00.000Z',
      },
    ]);

    render(<WorkingMemoryView />);

    fireEvent.click(await screen.findByTestId('wm-entry-send-btn-13'));

    const preview = await screen.findByTestId('send-to-board-entry-preview');
    expect(preview).toHaveTextContent(/Entry:\s*Line one\s*Line two/);
    expect(preview.className).toContain('whitespace-pre-wrap');
  });
});
