import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListColumn from '../components/ListColumn';
import * as api from '../services/api';

vi.mock('../services/api');
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() })
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => children,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false
  })
}));

describe('ListColumn - Title Editing', () => {
  const mockList = {
    id: 1,
    title: 'To Do',
    cards: [
      { id: 101, title: 'Task 1', list_id: 1 },
      { id: 102, title: 'Task 2', list_id: 1 }
    ]
  };

  const defaultProps = {
    list: mockList,
    onCardAdded: vi.fn(),
    onCardClick: vi.fn(),
    onDeleteList: vi.fn(),
    onListUpdated: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list title as clickable button', () => {
    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    expect(titleButton).toBeInTheDocument();
    expect(titleButton).toHaveAttribute('title', 'Edit list title');
  });

  it('clicking title shows input with current value', async () => {
    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('To Do');
    expect(input).toHaveFocus();
  });

  it('blur on input saves the new title', async () => {
    const updatedList = { ...mockList, title: 'Updated List' };
    api.updateList.mockResolvedValue(updatedList);

    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: 'Updated List' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateList).toHaveBeenCalledWith(1, { title: 'Updated List' });
      expect(defaultProps.onListUpdated).toHaveBeenCalledWith(updatedList);
    });
  });

  it('Enter key saves the new title', async () => {
    const updatedList = { ...mockList, title: 'New Title' };
    api.updateList.mockResolvedValue(updatedList);

    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(api.updateList).toHaveBeenCalledWith(1, { title: 'New Title' });
      expect(defaultProps.onListUpdated).toHaveBeenCalledWith(updatedList);
    });
  });

  it('Escape key cancels edit without saving', async () => {
    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: 'Cancelled' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(api.updateList).not.toHaveBeenCalled();
      expect(defaultProps.onListUpdated).not.toHaveBeenCalled();
      expect(input).not.toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'To Do' })).toBeInTheDocument();
  });

  it('empty title reverts to original without saving', async () => {
    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateList).not.toHaveBeenCalled();
      expect(defaultProps.onListUpdated).not.toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'To Do' })).toBeInTheDocument();
  });

  it('whitespace-only title reverts to original without saving', async () => {
    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateList).not.toHaveBeenCalled();
      expect(defaultProps.onListUpdated).not.toHaveBeenCalled();
    });

    expect(screen.getByRole('button', { name: 'To Do' })).toBeInTheDocument();
  });

  it('unchanged title does not call API', async () => {
    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: 'To Do' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateList).not.toHaveBeenCalled();
      expect(defaultProps.onListUpdated).not.toHaveBeenCalled();
    });
  });

  it('shows error message below input when update fails', async () => {
    api.updateList.mockRejectedValue(new Error('Network error'));

    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: 'Failed Update' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText(/Failed to update list title/)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    expect(screen.getByTestId('list-title-edit-input-1')).toHaveValue('To Do');
    expect(screen.getByTestId('list-title-edit-input-1')).toBeInTheDocument();
  });

  it('trims whitespace from titles before saving', async () => {
    const updatedList = { ...mockList, title: 'Trimmed Title' };
    api.updateList.mockResolvedValue(updatedList);

    render(<ListColumn {...defaultProps} />);

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    const input = screen.getByTestId('list-title-edit-input-1');
    fireEvent.change(input, { target: { value: '  Trimmed Title  ' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(api.updateList).toHaveBeenCalledWith(1, { title: 'Trimmed Title' });
    });
  });

  it('delete button remains visible during edit mode', async () => {
    render(<ListColumn {...defaultProps} />);

    const deleteButton = screen.getByTestId('delete-list-btn-1');
    expect(deleteButton).toBeInTheDocument();

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    expect(screen.getByTestId('delete-list-btn-1')).toBeInTheDocument();
  });

  it('card count remains visible during edit mode', async () => {
    render(<ListColumn {...defaultProps} />);

    expect(screen.getByText('2 cards')).toBeInTheDocument();

    const titleButton = screen.getByRole('button', { name: 'To Do' });
    fireEvent.click(titleButton);

    expect(screen.getByText('2 cards')).toBeInTheDocument();
  });
});
