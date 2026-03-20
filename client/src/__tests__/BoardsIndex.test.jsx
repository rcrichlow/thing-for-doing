import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import BoardsIndex from '../pages/boards/BoardsIndex';
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

describe('BoardsIndex', () => {
  const mockDispatch = vi.fn();
  const mockActions = {
    SET_BOARDS: 'SET_BOARDS',
    ADD_BOARD: 'ADD_BOARD',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders boards and create button', async () => {
    const mockBoards = [
      { id: 1, title: 'Project Alpha', created_at: '2023-01-01' },
      { id: 2, title: 'Project Beta', created_at: '2023-01-02' },
    ];

    api.getBoards.mockResolvedValue(mockBoards);
    BoardContext.useBoardContext.mockReturnValue({
      state: { boards: mockBoards },
      dispatch: mockDispatch,
      actions: mockActions,
    });

    render(
      <BrowserRouter>
        <BoardsIndex />
      </BrowserRouter>
    );

    expect(await screen.findByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
    
    expect(screen.getByTestId('new-board-btn')).toBeInTheDocument();
  });

  it('allows creating a new board', async () => {
    const mockBoards = [];
    const newBoard = { id: 3, title: 'New Project', created_at: '2023-01-03' };

    api.getBoards.mockResolvedValue(mockBoards);
    api.createBoard.mockResolvedValue(newBoard);
    
    BoardContext.useBoardContext.mockReturnValue({
      state: { boards: mockBoards },
      dispatch: mockDispatch,
      actions: mockActions,
    });

    render(
      <BrowserRouter>
        <BoardsIndex />
      </BrowserRouter>
    );

    const createBtn = await screen.findByTestId('new-board-btn');
    fireEvent.click(createBtn);

    const input = screen.getByTestId('board-title-input');
    fireEvent.change(input, { target: { value: 'New Project' } });

    const submitBtn = screen.getByTestId('board-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createBoard).toHaveBeenCalledWith({ title: 'New Project' });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: mockActions.ADD_BOARD,
        payload: newBoard,
      });
    });
  });
});
