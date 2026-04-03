import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BoardView from '../pages/boards/BoardView';
import * as api from '../services/api';
import * as BoardContext from '../context/BoardContext';

vi.mock('../services/api');
vi.mock('../context/BoardContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBoardContext: vi.fn(),
  };
});

describe('BoardView', () => {
  const renderBoardView = () => render(
    <MemoryRouter initialEntries={['/boards/1']}>
      <Routes>
        <Route path="/boards" element={<div>Boards Index</div>} />
        <Route path="/boards/archived" element={<div>Archived Boards Index</div>} />
        <Route path="/boards/:id" element={<BoardView />} />
      </Routes>
    </MemoryRouter>
  );

  const mockDispatch = vi.fn();
  const mockActions = {
    SET_BOARDS: 'SET_BOARDS',
    ADD_BOARD: 'ADD_BOARD',
    UPDATE_BOARD: 'UPDATE_BOARD',
    ARCHIVE_BOARD: 'ARCHIVE_BOARD',
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

  it('renders board title and lists', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [] },
        { id: 102, title: 'Doing', cards: [] }
      ]
    };
    
    api.getBoard.mockResolvedValue(mockBoard);

    renderBoardView();

    expect(await screen.findByText('Test Board')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Doing')).toBeInTheDocument();
    
    const columns = screen.getAllByTestId('list-column');
    expect(columns).toHaveLength(2);
  });

  it('allows adding a new list', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: []
    };
    const newList = { id: 103, title: 'Done', cards: [] };

    api.getBoard.mockResolvedValue(mockBoard);
    api.createList.mockResolvedValue(newList);

    renderBoardView();

    await screen.findByText('Test Board');

    const input = screen.getByTestId('list-title-input');
    fireEvent.change(input, { target: { value: 'Done' } });

    const addBtn = screen.getByTestId('add-list-btn');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(api.createList).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Done' }));
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('allows adding a new card', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [] }
      ]
    };
    const newCard = { id: 201, title: 'New Task', description: '' };

    api.getBoard.mockResolvedValue(mockBoard);
    api.createCard.mockResolvedValue(newCard);

    renderBoardView();

    await screen.findByText('Test Board');

    const addCardBtn = screen.getByTestId('add-card-btn');
    fireEvent.click(addCardBtn);

    const input = screen.getByTestId('card-title-input');
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.submit(input.form);

    await waitFor(() => {
      expect(api.createCard).toHaveBeenCalledWith(101, expect.objectContaining({ title: 'New Task' }));
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('deletes a card from the card detail modal after confirmation', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [{ id: 201, title: 'Task 1', description: 'Details', list_id: 101 }] }
      ]
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.deleteCard.mockResolvedValue(null);

    renderBoardView();

    fireEvent.click(await screen.findByText('Task 1'));
    fireEvent.click(await screen.findByTestId('card-detail-delete-btn'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(api.deleteCard).toHaveBeenCalledWith(201);
    });

    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('card-detail')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('opens the list delete modal and transfers cards when a target list is selected', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [{ id: 201, title: 'Task 1', list_id: 101 }] },
        { id: 102, title: 'Done', cards: [] }
      ]
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.deleteList.mockResolvedValue(null);

    renderBoardView();

    await screen.findByText('Test Board');
    fireEvent.click(screen.getByTestId('delete-list-btn-101'));

    fireEvent.change(await screen.findByTestId('transfer-list-select'), { target: { value: '102' } });
    fireEvent.click(screen.getByTestId('confirm-delete-list-btn'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(api.deleteList).toHaveBeenCalledWith(101, { transfer_list_id: 102 });
    });

    await waitFor(() => {
      expect(screen.queryByText('To Do')).not.toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('deletes cards with a list when no transfer target is selected', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [{ id: 201, title: 'Task 1', list_id: 101 }] },
        { id: 102, title: 'Done', cards: [] }
      ]
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.deleteList.mockResolvedValue(null);

    renderBoardView();

    await screen.findByText('Test Board');
    fireEvent.click(screen.getByTestId('delete-list-btn-101'));
    fireEvent.click(await screen.findByTestId('confirm-delete-list-btn'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(api.deleteList).toHaveBeenCalledWith(101, undefined);
    });

    await waitFor(() => {
      expect(screen.queryByText('To Do')).not.toBeInTheDocument();
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it('archives an active board', async () => {
    const mockBoard = {
      id: 1,
      title: 'Active Board',
      lists: []
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.archiveBoard.mockResolvedValue(null);

    renderBoardView();

    await screen.findByText('Active Board');
    
    const archiveBtn = screen.getByTitle('Archive Board');
    fireEvent.click(archiveBtn);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(api.archiveBoard).toHaveBeenCalledWith(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: mockActions.ARCHIVE_BOARD,
        payload: mockBoard,
      });
    });

    confirmSpy.mockRestore();
  });

  it('deletes an active board', async () => {
    const mockBoard = {
      id: 1,
      title: 'Active Board',
      lists: []
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.deleteBoard.mockResolvedValue(null);

    renderBoardView();

    await screen.findByText('Active Board');
    
    const deleteBtn = screen.getByTitle('Delete Board');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(api.deleteBoard).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('displays archived status and allows deleting archived board', async () => {
    const mockBoard = {
      id: 1,
      title: 'Archived Board',
      archived_at: '2023-01-01',
      lists: []
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.deleteBoard.mockResolvedValue(null);

    renderBoardView();

    await screen.findByText('Archived Board');
    expect(screen.getByText('This board is archived.')).toBeInTheDocument();
    expect(screen.queryByTitle('Archive Board')).not.toBeInTheDocument();

    const deleteBtn = screen.getByText('Delete Permanently');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(api.deleteBoard).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('displays archived status and allows unarchiving archived board', async () => {
    const mockBoard = {
      id: 1,
      title: 'Archived Board',
      archived_at: '2023-01-01',
      lists: []
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.unarchiveBoard.mockResolvedValue(null);

    renderBoardView();

    await screen.findByText('Archived Board');
    expect(screen.getByText('This board is archived.')).toBeInTheDocument();
    
    const unarchiveBtn = screen.getByTestId('unarchive-board-btn');
    fireEvent.click(unarchiveBtn);

    await waitFor(() => {
      expect(api.unarchiveBoard).toHaveBeenCalledWith(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: mockActions.UNARCHIVE_BOARD,
        payload: { ...mockBoard, archived_at: null },
      });
    });
  });

  it('displays error when board delete fails', async () => {
    const mockBoard = {
      id: 1,
      title: 'Active Board',
      lists: []
    };
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    api.getBoard.mockResolvedValue(mockBoard);
    api.deleteBoard.mockRejectedValue(new Error('Network error'));

    renderBoardView();

    await screen.findByText('Active Board');
    
    const deleteBtn = screen.getByTitle('Delete Board');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(api.deleteBoard).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByText('Failed to delete board: Network error')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('allows editing board title', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };
    const updatedBoard = {
      ...mockBoard,
      title: 'Updated Title'
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateBoard.mockResolvedValue(updatedBoard);

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    // Click title to enter edit mode
    fireEvent.click(titleElement);

    // Input should appear with original title
    const input = screen.getByTestId('board-title-input');
    expect(input).toHaveValue('Original Title');

    // Change the title
    fireEvent.change(input, { target: { value: 'Updated Title' } });

    // Blur to save
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateBoard).toHaveBeenCalledWith(1, { title: 'Updated Title' });
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'UPDATE_BOARD',
        payload: updatedBoard
      });
    });

    expect(await screen.findByText('Updated Title')).toBeInTheDocument();
  });

  it('allows editing board title with Enter key', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };
    const updatedBoard = {
      ...mockBoard,
      title: 'New Title'
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateBoard.mockResolvedValue(updatedBoard);

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    fireEvent.click(titleElement);

    const input = screen.getByTestId('board-title-input');
    fireEvent.change(input, { target: { value: 'New Title' } });

    // Press Enter to save
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(api.updateBoard).toHaveBeenCalledWith(1, { title: 'New Title' });
    });
  });

  it('cancels board title edit with Escape key', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };

    api.getBoard.mockResolvedValue(mockBoard);

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    fireEvent.click(titleElement);

    const input = screen.getByTestId('board-title-input');
    fireEvent.change(input, { target: { value: 'Changed Title' } });

    // Press Escape to cancel
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(api.updateBoard).not.toHaveBeenCalled();
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });
  });

  it('reverts to original title if empty on blur', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };

    api.getBoard.mockResolvedValue(mockBoard);

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    fireEvent.click(titleElement);

    const input = screen.getByTestId('board-title-input');
    fireEvent.change(input, { target: { value: '' } });

    // Blur with empty value
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateBoard).not.toHaveBeenCalled();
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });
  });

  it('reverts to original title if unchanged', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };

    api.getBoard.mockResolvedValue(mockBoard);

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    fireEvent.click(titleElement);

    const input = screen.getByTestId('board-title-input');
    
    // Blur without changing value
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateBoard).not.toHaveBeenCalled();
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });
  });

  it('shows error message when board title update fails', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateBoard.mockRejectedValue(new Error('Update failed'));

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    fireEvent.click(titleElement);

    const input = screen.getByTestId('board-title-input');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateBoard).toHaveBeenCalledWith(1, { title: 'New Title' });
    });

    expect(await screen.findByText(/Failed to update board title/)).toBeInTheDocument();
  });

  it('trims whitespace from board title', async () => {
    const mockBoard = {
      id: 1,
      title: 'Original Title',
      lists: []
    };
    const updatedBoard = {
      ...mockBoard,
      title: 'Trimmed Title'
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateBoard.mockResolvedValue(updatedBoard);

    renderBoardView();

    const titleElement = await screen.findByText('Original Title');

    fireEvent.click(titleElement);

    const input = screen.getByTestId('board-title-input');
    fireEvent.change(input, { target: { value: '  Trimmed Title  ' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateBoard).toHaveBeenCalledWith(1, { title: 'Trimmed Title' });
    });
  });
});
