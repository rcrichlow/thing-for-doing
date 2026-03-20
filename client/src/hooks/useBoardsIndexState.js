import { useCallback, useEffect, useState } from 'react';
import { useBoardContext } from '../context/BoardContext';
import { getBoards, createBoard } from '../services/api';

export default function useBoardsIndexState() {
  const { state, dispatch, actions } = useBoardContext();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBoards() {
      try {
        setLoading(true);
        const boards = await getBoards();
        dispatch({ type: actions.SET_BOARDS, payload: boards });
        setLocalError(null);
      } catch {
        setLocalError('Failed to load boards');
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, [dispatch, actions.SET_BOARDS]);

  const handleCreateBoard = useCallback(async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      const newBoard = await createBoard({ title: newBoardTitle });
      dispatch({ type: actions.ADD_BOARD, payload: newBoard });
      setNewBoardTitle('');
      setIsCreating(false);
      setLocalError(null);
    } catch {
      setLocalError('Failed to create board');
    }
  }, [newBoardTitle, dispatch, actions.ADD_BOARD]);

  return {
    boards: state.boards,
    newBoardTitle,
    setNewBoardTitle,
    localError,
    isCreating,
    setIsCreating,
    loading,
    handleCreateBoard
  };
}
