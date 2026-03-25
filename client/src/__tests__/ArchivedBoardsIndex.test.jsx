import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ArchivedBoardsIndex from '../pages/boards/ArchivedBoardsIndex';
import * as BoardContext from '../context/BoardContext';
import * as api from '../services/api';

vi.mock('../services/api');
vi.mock('../context/BoardContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBoardContext: vi.fn(),
  };
});

describe('ArchivedBoardsIndex', () => {
  const mockDispatch = vi.fn();
  const mockActions = {
    UNARCHIVE_BOARD: 'UNARCHIVE_BOARD',
    DELETE_BOARD: 'DELETE_BOARD',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    BoardContext.useBoardContext.mockReturnValue({
      dispatch: mockDispatch,
      actions: mockActions,
    });
  });

  it('renders archived boards', async () => {
    const mockArchivedBoards = [
      { id: 1, title: 'Old Project', archived_at: '2023-01-01' },
    ];

    api.getArchivedBoards.mockResolvedValue(mockArchivedBoards);

    render(
      <BrowserRouter>
        <ArchivedBoardsIndex />
      </BrowserRouter>
    );

    expect(await screen.findByText('Old Project')).toBeInTheDocument();
  });

  it('allows unarchiving a board', async () => {
    const mockArchivedBoards = [
      { id: 1, title: 'Old Project', archived_at: '2023-01-01' },
    ];

    api.getArchivedBoards.mockResolvedValue(mockArchivedBoards);
    api.unarchiveBoard.mockResolvedValue(null);

    render(
      <BrowserRouter>
        <ArchivedBoardsIndex />
      </BrowserRouter>
    );

    await screen.findByText('Old Project');

    const unarchiveBtn = screen.getByTestId('unarchive-board-1');
    fireEvent.click(unarchiveBtn);

    await waitFor(() => {
      expect(api.unarchiveBoard).toHaveBeenCalledWith(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: mockActions.UNARCHIVE_BOARD,
        payload: { id: 1, title: 'Old Project', archived_at: null },
      });
    });
  });

  it('allows deleting a board permanently', async () => {
    const mockArchivedBoards = [
      { id: 1, title: 'Old Project', archived_at: '2023-01-01' },
    ];

    api.getArchivedBoards.mockResolvedValue(mockArchivedBoards);
    api.deleteBoard.mockResolvedValue(null);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <BrowserRouter>
        <ArchivedBoardsIndex />
      </BrowserRouter>
    );

    await screen.findByText('Old Project');

    const deleteBtn = screen.getByTestId('delete-board-1');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(api.deleteBoard).toHaveBeenCalledWith(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: mockActions.DELETE_BOARD,
        payload: 1,
      });
    });

    confirmSpy.mockRestore();
  });

  it('shows an error state when archived boards fail to load', async () => {
    api.getArchivedBoards.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <ArchivedBoardsIndex />
      </BrowserRouter>
    );

    expect(await screen.findByText('Error loading archived boards')).toBeInTheDocument();
    expect(screen.getByText('Failed to load archived boards')).toBeInTheDocument();
  });
});
