import { useCallback, useEffect, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import useAsyncPageData from './useAsyncPageData';
import {
  createList,
  getBoard,
  updateCard
} from '../services/api';

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}

function buildMovedBoard(board, activeId, overId) {
  const lists = board?.lists || [];

  const findContainer = (itemId) => {
    if (lists.find((list) => list.id === itemId)) {
      return itemId;
    }

    return lists.find((list) => list.cards?.some((card) => card.id === itemId))?.id;
  };

  const activeContainer = findContainer(activeId);
  const overContainer = findContainer(overId);

  if (!activeContainer || !overContainer) {
    return null;
  }

  const activeList = lists.find((list) => list.id === activeContainer);
  const overList = lists.find((list) => list.id === overContainer);

  if (!activeList || !overList) {
    return null;
  }

  const activeListCards = activeList.cards || [];
  const activeCardIndex = activeListCards.findIndex((card) => card.id === activeId);
  const activeCard = activeListCards[activeCardIndex];

  if (!activeCard) {
    return null;
  }

  if (activeContainer === overContainer) {
    const overCardIndex = activeId === overId
      ? activeCardIndex
      : activeListCards.findIndex((card) => card.id === overId);

    if (overCardIndex < 0 || overCardIndex === activeCardIndex) {
      return null;
    }

    const reorderedCards = arrayMove(activeListCards, activeCardIndex, overCardIndex);

    return {
      nextBoard: {
        ...board,
        lists: lists.map((list) => (
          list.id === activeContainer
            ? { ...list, cards: reorderedCards }
            : list
        ))
      },
      nextListId: activeContainer,
      nextPosition: overCardIndex
    };
  }

  const newActiveListCards = [...activeListCards];
  newActiveListCards.splice(activeCardIndex, 1);

  const newOverListCards = [...(overList.cards || [])];
  const overCardIndex = overId === overContainer
    ? newOverListCards.length
    : newOverListCards.findIndex((card) => card.id === overId);
  const newIndex = overCardIndex >= 0 ? overCardIndex : newOverListCards.length;

  newOverListCards.splice(newIndex, 0, { ...activeCard, list_id: overContainer });

  return {
    nextBoard: {
      ...board,
      lists: lists.map((list) => {
        if (list.id === activeContainer) {
          return { ...list, cards: newActiveListCards };
        }

        if (list.id === overContainer) {
          return { ...list, cards: newOverListCards };
        }

        return list;
      })
    },
    nextListId: overContainer,
    nextPosition: newIndex
  };
}

export default function useBoardViewState(boardId) {
  const [board, setBoard] = useState(null);
  const [activeDragCardId, setActiveDragCardId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const { loading, error, clearError, runAsync } = useAsyncPageData();

  useEffect(() => {
    if (!boardId) {
      return;
    }

    runAsync(async () => {
      const boardData = await getBoard(boardId);

      setBoard(boardData);
      setActionError(null);
    }).catch(() => {});
  }, [boardId, runAsync]);

  const handleCardClick = useCallback((card) => {
    setSelectedCard(card);
  }, []);

  const closeCardDetail = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const handleCreateList = useCallback(async (event) => {
    event.preventDefault();

    if (!newListTitle.trim()) {
      return;
    }

    try {
      setIsCreatingList(true);
      const newList = await createList(boardId, {
        title: newListTitle,
        position: board?.lists ? board.lists.length : 0
      });

      setBoard((previousBoard) => ({
        ...previousBoard,
        lists: [...(previousBoard.lists || []), newList]
      }));
      setNewListTitle('');
      setActionError(null);
      clearError();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsCreatingList(false);
    }
  }, [board, boardId, clearError, newListTitle]);

  const handleCardAdded = useCallback((listId, newCard) => {
    setBoard((previousBoard) => ({
      ...previousBoard,
      lists: previousBoard.lists.map((list) => (
        list.id === listId
          ? { ...list, cards: [...(list.cards || []), newCard] }
          : list
      ))
    }));
  }, []);

  const handleDragEnd = useCallback(async (event) => {
    if (!board) {
      setActiveDragCardId(null);
      return;
    }

    const { active, over } = event;

    if (!over) {
      setActiveDragCardId(null);
      return;
    }

    const moveResult = buildMovedBoard(board, active.id, over.id);

    if (!moveResult) {
      setActiveDragCardId(null);
      return;
    }

    const previousBoard = board;
    setBoard(moveResult.nextBoard);

    try {
      await updateCard(active.id, {
        list_id: moveResult.nextListId,
        position: moveResult.nextPosition
      });
      setActionError(null);
      clearError();
    } catch (err) {
      setBoard(previousBoard);
      setActionError(`Failed to move card: ${getErrorMessage(err)}`);
    } finally {
      setActiveDragCardId(null);
    }
  }, [board, clearError]);

  const handleDragStart = useCallback((event) => {
    setActiveDragCardId(event.active?.id ?? null);
  }, []);

  const activeDragCard = activeDragCardId == null
    ? null
    : board?.lists
      ?.flatMap((list) => list.cards || [])
      .find((card) => card.id === activeDragCardId) || null;

  return {
    board,
    activeDragCard,
    loading,
    error,
    actionError,
    newListTitle,
    isCreatingList,
    selectedCard,
    setNewListTitle,
    handleDragStart,
    handleCardClick,
    closeCardDetail,
    handleCreateList,
    handleCardAdded,
    handleDragEnd
  };
}
