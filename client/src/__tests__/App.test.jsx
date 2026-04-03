import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { BoardProvider } from '../context/BoardContext';

vi.mock('../services/api', () => ({
  getBoards: vi.fn().mockResolvedValue([]),
  getArchivedBoards: vi.fn().mockResolvedValue([]),
  createBoard: vi.fn(),
  archiveBoard: vi.fn(),
  unarchiveBoard: vi.fn(),
  updateBoard: vi.fn(),
  deleteBoard: vi.fn(),
  getLists: vi.fn().mockResolvedValue([]),
  createList: vi.fn(),
  updateList: vi.fn(),
  deleteList: vi.fn(),
  getCards: vi.fn().mockResolvedValue([]),
  createCard: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  getWorkingMemoryEntries: vi.fn().mockResolvedValue([]),
  createWorkingMemoryEntry: vi.fn(),
  updateWorkingMemoryEntry: vi.fn(),
  deleteWorkingMemoryEntry: vi.fn(),
  clearWorkingMemory: vi.fn()
}));

describe('App Component', () => {
  const renderApp = () => {
    return render(
      <BoardProvider>
        <App />
      </BoardProvider>
    );
  };

  it('renders the main layout and working memory view by default', async () => {
    renderApp();

    expect(screen.getByText('Thing For Doing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Boards/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Working Memory/i })).toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: 'Working Memory' })).toBeInTheDocument();
  });
});
