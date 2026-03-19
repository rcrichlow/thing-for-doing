import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BoardProvider, useBoardContext } from '../BoardContext';

describe('BoardContext', () => {
  const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>;

  describe('Board Actions', () => {
    it('sets boards with SET_BOARDS', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const boards = [
        { id: 1, title: 'Board 1' },
        { id: 2, title: 'Board 2' }
      ];

      act(() => {
        result.current.dispatch({ type: result.current.actions.SET_BOARDS, payload: boards });
      });

      expect(result.current.state.boards).toEqual(boards);
      expect(result.current.state.loading).toBe(false);
    });

    it('adds a board with ADD_BOARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const newBoard = { id: 1, title: 'New Board' };

      act(() => {
        result.current.dispatch({ type: result.current.actions.ADD_BOARD, payload: newBoard });
      });

      expect(result.current.state.boards).toContainEqual(newBoard);
    });

    it('updates a board with UPDATE_BOARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const initialBoard = { id: 1, title: 'Original' };
      const updatedBoard = { id: 1, title: 'Updated' };

      act(() => {
        result.current.dispatch({ type: result.current.actions.ADD_BOARD, payload: initialBoard });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.UPDATE_BOARD, payload: updatedBoard });
      });

      expect(result.current.state.boards[0].title).toBe('Updated');
    });

    it('deletes a board and cascades to lists and cards with DELETE_BOARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      
      act(() => {
        result.current.dispatch({ 
          type: result.current.actions.SET_BOARDS, 
          payload: [{ id: 1, title: 'Board 1' }] 
        });
        result.current.dispatch({ 
          type: result.current.actions.SET_LISTS, 
          payload: [{ id: 101, title: 'List 1', board_id: 1 }] 
        });
        result.current.dispatch({ 
          type: result.current.actions.SET_CARDS, 
          payload: [{ id: 201, title: 'Card 1', list_id: 101 }] 
        });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.DELETE_BOARD, payload: 1 });
      });

      expect(result.current.state.boards).toHaveLength(0);
      expect(result.current.state.lists).toHaveLength(0);
      expect(result.current.state.cards).toHaveLength(0);
    });
  });

  describe('List Actions', () => {
    it('sets lists with SET_LISTS', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const lists = [
        { id: 101, title: 'List 1', board_id: 1 },
        { id: 102, title: 'List 2', board_id: 1 }
      ];

      act(() => {
        result.current.dispatch({ type: result.current.actions.SET_LISTS, payload: lists });
      });

      expect(result.current.state.lists).toEqual(lists);
    });

    it('adds a list with ADD_LIST', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const newList = { id: 101, title: 'New List', board_id: 1 };

      act(() => {
        result.current.dispatch({ type: result.current.actions.ADD_LIST, payload: newList });
      });

      expect(result.current.state.lists).toContainEqual(newList);
    });

    it('updates a list with UPDATE_LIST', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const initialList = { id: 101, title: 'Original', board_id: 1 };
      const updatedList = { id: 101, title: 'Updated', board_id: 1 };

      act(() => {
        result.current.dispatch({ type: result.current.actions.ADD_LIST, payload: initialList });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.UPDATE_LIST, payload: updatedList });
      });

      expect(result.current.state.lists[0].title).toBe('Updated');
    });

    it('deletes a list and cascades to cards with DELETE_LIST', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      
      act(() => {
        result.current.dispatch({ 
          type: result.current.actions.SET_LISTS, 
          payload: [{ id: 101, title: 'List 1', board_id: 1 }] 
        });
        result.current.dispatch({ 
          type: result.current.actions.SET_CARDS, 
          payload: [{ id: 201, title: 'Card 1', list_id: 101 }] 
        });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.DELETE_LIST, payload: 101 });
      });

      expect(result.current.state.lists).toHaveLength(0);
      expect(result.current.state.cards).toHaveLength(0);
    });
  });

  describe('Card Actions', () => {
    it('sets cards with SET_CARDS', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const cards = [
        { id: 201, title: 'Card 1', list_id: 101 },
        { id: 202, title: 'Card 2', list_id: 101 }
      ];

      act(() => {
        result.current.dispatch({ type: result.current.actions.SET_CARDS, payload: cards });
      });

      expect(result.current.state.cards).toEqual(cards);
    });

    it('adds a card with ADD_CARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const newCard = { id: 201, title: 'New Card', list_id: 101 };

      act(() => {
        result.current.dispatch({ type: result.current.actions.ADD_CARD, payload: newCard });
      });

      expect(result.current.state.cards).toContainEqual(newCard);
    });

    it('updates a card with UPDATE_CARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const initialCard = { id: 201, title: 'Original', list_id: 101 };
      const updatedCard = { id: 201, title: 'Updated', list_id: 102 };

      act(() => {
        result.current.dispatch({ type: result.current.actions.ADD_CARD, payload: initialCard });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.UPDATE_CARD, payload: updatedCard });
      });

      expect(result.current.state.cards[0].title).toBe('Updated');
      expect(result.current.state.cards[0].list_id).toBe(102);
    });

    it('deletes a card with DELETE_CARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      
      act(() => {
        result.current.dispatch({ 
          type: result.current.actions.SET_CARDS, 
          payload: [{ id: 201, title: 'Card 1', list_id: 101 }] 
        });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.DELETE_CARD, payload: 201 });
      });

      expect(result.current.state.cards).toHaveLength(0);
    });
  });

  describe('Meta Actions', () => {
    it('sets loading state with SET_LOADING', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });

      act(() => {
        result.current.dispatch({ type: result.current.actions.SET_LOADING, payload: true });
      });

      expect(result.current.state.loading).toBe(true);

      act(() => {
        result.current.dispatch({ type: result.current.actions.SET_LOADING, payload: false });
      });

      expect(result.current.state.loading).toBe(false);
    });

    it('sets error state with SET_ERROR', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });
      const error = 'Something went wrong';

      act(() => {
        result.current.dispatch({ type: result.current.actions.SET_ERROR, payload: error });
      });

      expect(result.current.state.error).toBe(error);
      expect(result.current.state.loading).toBe(false);
    });
  });

  describe('Hook Usage', () => {
    it('throws error when used outside provider', () => {
      expect(() => {
        renderHook(() => useBoardContext());
      }).toThrow('useBoardContext must be used within a BoardProvider');
    });
  });
});
