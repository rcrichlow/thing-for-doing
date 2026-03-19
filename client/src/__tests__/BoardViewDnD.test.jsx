import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BoardView from '../pages/boards/BoardView';
import * as api from '../services/api';

vi.mock('../services/api');

let mockDragEndEvent = {
  active: { id: 201 },
  over: { id: 102 }
};

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }) => {
      return (
        <div data-testid="dnd-context">
          <button 
            data-testid="trigger-drag-end"
            onClick={() => onDragEnd(mockDragEndEvent)}
          >
            Trigger Drag End
          </button>
          {children}
        </div>
      );
    },
    useSensor: vi.fn(),
    useSensors: vi.fn(),
    PointerSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
  };
});

describe('BoardView DnD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDragEndEvent = {
      active: { id: 201 },
      over: { id: 102 }
    };
  });

  it('reorders cards within the same list', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        {
          id: 101,
          title: 'To Do',
          cards: [
            { id: 201, title: 'Task 1', list_id: 101 },
            { id: 202, title: 'Task 2', list_id: 101 }
          ]
        }
      ]
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateCard.mockResolvedValue({});
    mockDragEndEvent = {
      active: { id: 201 },
      over: { id: 202 }
    };

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Test Board');

    fireEvent.click(screen.getByTestId('trigger-drag-end'));

    await waitFor(() => {
      expect(api.updateCard).toHaveBeenCalledWith(201, expect.objectContaining({
        list_id: 101,
        position: 1
      }));
    });

    const [todoList] = screen.getAllByTestId('list-column');

    await waitFor(() => {
      const cards = within(todoList).getAllByTestId('card-item');
      expect(cards[0]).toHaveTextContent('Task 2');
      expect(cards[1]).toHaveTextContent('Task 1');
    });
  });

  it('moves card between lists', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [{ id: 201, title: 'Task 1', list_id: 101 }] },
        { id: 102, title: 'Done', cards: [] }
      ]
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateCard.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Test Board');

    fireEvent.click(screen.getByTestId('trigger-drag-end'));

    await waitFor(() => {
      expect(api.updateCard).toHaveBeenCalledWith(201, expect.objectContaining({ 
        list_id: 102,
        position: 0 
      }));
    });

    const [todoList, doneList] = screen.getAllByTestId('list-column');

    await waitFor(() => {
      expect(within(todoList).queryByText('Task 1')).not.toBeInTheDocument();
      expect(within(doneList).getByText('Task 1')).toBeInTheDocument();
    });
  });

  it('rolls card back and surfaces an error when move persistence fails', async () => {
    const mockBoard = {
      id: 1,
      title: 'Test Board',
      lists: [
        { id: 101, title: 'To Do', cards: [{ id: 201, title: 'Task 1', list_id: 101 }] },
        { id: 102, title: 'Done', cards: [] }
      ]
    };

    api.getBoard.mockResolvedValue(mockBoard);
    api.updateCard.mockRejectedValue(new Error('Network down'));

    render(
      <MemoryRouter initialEntries={['/boards/1']}>
        <Routes>
          <Route path="/boards/:id" element={<BoardView />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Test Board');

    fireEvent.click(screen.getByTestId('trigger-drag-end'));

    await waitFor(() => {
      expect(api.updateCard).toHaveBeenCalledWith(201, expect.objectContaining({
        list_id: 102,
        position: 0
      }));
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to move card: Network down')).toBeInTheDocument();
    });

    const [todoList, doneList] = screen.getAllByTestId('list-column');

    expect(within(todoList).getByText('Task 1')).toBeInTheDocument();
    expect(within(doneList).queryByText('Task 1')).not.toBeInTheDocument();
  });
});
