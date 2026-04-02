import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import BoardsIndex from '../pages/boards/BoardsIndex';
import BoardView from '../pages/boards/BoardView';
import { BoardProvider } from '../context/BoardContext';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  getBoards: vi.fn(),
  createBoard: vi.fn(),
  getBoard: vi.fn(),
  createList: vi.fn(),
  updateCard: vi.fn(),
}));

// Mock DndContext to avoid issues in tests
vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children }) => <div>{children}</div>,
    useSensor: () => {},
    useSensors: () => [],
  };
});

describe('Empty States', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('BoardsIndex', () => {
    it('shows empty state when no boards exist', async () => {
      api.getBoards.mockResolvedValue([]);

      render(
        <BrowserRouter>
          <BoardProvider>
            <BoardsIndex />
          </BoardProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId('board-card')).toHaveLength(0);
      });
      expect(screen.queryByTestId('board-title-input')).not.toBeInTheDocument();
      expect(screen.getByTestId('new-board-btn')).toBeInTheDocument();
    });

    it('allows creating a board from empty state', async () => {
      api.getBoards.mockResolvedValue([]);
      api.createBoard.mockResolvedValue({ id: 1, title: 'New Board', created_at: new Date().toISOString() });

      render(
        <BrowserRouter>
          <BoardProvider>
            <BoardsIndex />
          </BoardProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('new-board-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('new-board-btn'));
      
      const input = screen.getByTestId('board-title-input');
      fireEvent.change(input, { target: { value: 'New Board' } });
      fireEvent.click(screen.getByTestId('board-submit-btn'));

      await waitFor(() => {
        expect(api.createBoard).toHaveBeenCalledWith({ title: 'New Board' });
      });

      expect(await screen.findByText('New Board')).toBeInTheDocument();
    });
  });

  describe('BoardView', () => {
    it('shows empty state when board has no lists', async () => {
      const emptyBoard = { id: 1, title: 'Empty Board', lists: [] };
      api.getBoard.mockResolvedValue(emptyBoard);

      render(
        <MemoryRouter initialEntries={['/boards/1']}>
          <BoardProvider>
            <Routes>
              <Route path="/boards/:id" element={<BoardView />} />
            </Routes>
          </BoardProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId('list-column')).toHaveLength(0);
      });
      expect(screen.getByTestId('list-title-input')).toBeInTheDocument();
      expect(screen.getByTestId('add-list-btn')).toBeInTheDocument();
    });

    it('shows error state when API fails', async () => {
      api.getBoard.mockRejectedValue(new Error('Failed to fetch'));

      render(
        <MemoryRouter initialEntries={['/boards/1']}>
          <BoardProvider>
            <Routes>
              <Route path="/boards/:id" element={<BoardView />} />
            </Routes>
          </BoardProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Return to Boards/i })).toHaveAttribute('href', '/boards');
      });
      expect(screen.queryAllByTestId('list-column')).toHaveLength(0);
      expect(screen.queryByTestId('list-title-input')).not.toBeInTheDocument();
    });
  });
});
