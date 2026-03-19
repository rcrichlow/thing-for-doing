import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BoardView from '../pages/BoardView';
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
});
