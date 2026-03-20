import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BoardView from '../pages/boards/BoardView';
import * as api from '../services/api';

vi.mock('../services/api');

describe('BoardView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

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

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

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

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Test Board');

    const addCardBtn = screen.getByTestId('add-card-btn');
    fireEvent.click(addCardBtn);

    const input = screen.getByTestId('card-title-input');
    fireEvent.change(input, { target: { value: 'New Task' } });

    const submitBtn = screen.getByText('Add');
    fireEvent.click(submitBtn);

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

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByText('Task 1'));
    fireEvent.click(await screen.findByTestId('card-detail-delete-btn'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this card? This action cannot be undone.');
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

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Test Board');
    fireEvent.click(screen.getByTestId('delete-list-btn-101'));

    fireEvent.change(await screen.findByTestId('transfer-list-select'), { target: { value: '102' } });
    fireEvent.click(screen.getByTestId('confirm-delete-list-btn'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this list and move its cards to "Done"? This action cannot be undone.');
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

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Test Board');
    fireEvent.click(screen.getByTestId('delete-list-btn-101'));
    fireEvent.click(await screen.findByTestId('confirm-delete-list-btn'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this list? All cards in it will also be deleted. This action cannot be undone.');
      expect(api.deleteList).toHaveBeenCalledWith(101, undefined);
    });

    await waitFor(() => {
      expect(screen.queryByText('To Do')).not.toBeInTheDocument();
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });
});
