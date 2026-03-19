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
        expect(screen.getByText('No boards yet')).toBeInTheDocument();
      });
      expect(screen.getByText('Create your first board to start organizing your tasks and ideas.')).toBeInTheDocument();
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
      
      // Should now see the form
      expect(screen.getByTestId('board-title-input')).toBeInTheDocument();
    });
  });

  describe('BoardView', () => {
    it('shows empty state when board has no lists', async () => {
      const emptyBoard = { id: 1, title: 'Empty Board', lists: [] };
      api.getBoard.mockResolvedValue(emptyBoard);

      render(
        <MemoryRouter initialEntries={['/boards/1']}>
          <Routes>
            <Route path="/boards/:id" element={<BoardView />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Start your workflow')).toBeInTheDocument();
      });
      expect(screen.getByText('Create your first list to start adding cards and tasks to this board.')).toBeInTheDocument();
      expect(screen.getByTestId('add-list-btn')).toBeInTheDocument();
    });

    it('shows error state when API fails', async () => {
      api.getBoard.mockRejectedValue(new Error('Failed to fetch'));

      render(
        <MemoryRouter initialEntries={['/boards/1']}>
          <Routes>
            <Route path="/boards/:id" element={<BoardView />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading board')).toBeInTheDocument();
      });
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });
});
