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

    it('deletes a board with DELETE_BOARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.SET_BOARDS,
          payload: [{ id: 1, title: 'Board 1' }]
        });
      });

      act(() => {
        result.current.dispatch({ type: result.current.actions.DELETE_BOARD, payload: 1 });
      });

      expect(result.current.state.boards).toHaveLength(0);
    });

    it('archives a board with ARCHIVE_BOARD', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.SET_BOARDS,
          payload: [{ id: 1, title: 'Board 1' }, { id: 2, title: 'Board 2' }]
        });
      });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.ARCHIVE_BOARD,
          payload: { id: 1, title: 'Board 1', archived_at: '2026-03-24T12:00:00Z' }
        });
      });

      expect(result.current.state.boards).toEqual([{ id: 2, title: 'Board 2' }]);
    });

    it('unarchives a board with UNARCHIVE_BOARD by adding it back to the active collection', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.SET_BOARDS,
          payload: [{ id: 2, title: 'Board 2' }]
        });
      });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.UNARCHIVE_BOARD,
          payload: { id: 1, title: 'Board 1', archived_at: null }
        });
      });

      expect(result.current.state.boards).toEqual([
        { id: 2, title: 'Board 2' },
        { id: 1, title: 'Board 1', archived_at: null }
      ]);
    });

    it('unarchives a board with UNARCHIVE_BOARD by updating an existing active board entry', () => {
      const { result } = renderHook(() => useBoardContext(), { wrapper });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.SET_BOARDS,
          payload: [{ id: 1, title: 'Board 1', archived_at: '2026-03-23T12:00:00Z' }]
        });
      });

      act(() => {
        result.current.dispatch({
          type: result.current.actions.UNARCHIVE_BOARD,
          payload: { id: 1, title: 'Board 1', archived_at: null }
        });
      });

      expect(result.current.state.boards).toEqual([{ id: 1, title: 'Board 1', archived_at: null }]);
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
