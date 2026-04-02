import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { arrayMove } from '@dnd-kit/sortable';
import useAsyncPageData from './useAsyncPageData';
import getErrorMessage from '../utils/getErrorMessage';
import { useBoardContext } from '../context/BoardContext';
import {
  createList,
  deleteCard,
  deleteList,
  getBoard,
  updateCard,
  updateBoard,
  archiveBoard,
  unarchiveBoard,
  deleteBoard
} from '../services/api';

function removeCardFromBoard(board, cardId) {
  return {
    ...board,
    lists: board.lists.map((list) => ({
      ...list,
      cards: (list.cards || []).filter((card) => card.id !== cardId)
    }))
  };
}

function removeListFromBoard(board, listId, transferListId = null) {
  const sourceList = board.lists.find((list) => list.id === listId);

  if (!sourceList) {
    return board;
  }

  return {
    ...board,
    lists: board.lists
      .filter((list) => list.id !== listId)
      .map((list) => {
        if (transferListId && list.id === transferListId) {
          return {
            ...list,
            cards: [
              ...(list.cards || []),
              ...(sourceList.cards || []).map((card) => ({ ...card, list_id: transferListId }))
            ]
          };
        }

        return list;
      })
  };
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
  const navigate = useNavigate();
  const { dispatch, actions } = useBoardContext();
  const [board, setBoard] = useState(null);
  const [activeDragCardId, setActiveDragCardId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [listPendingDelete, setListPendingDelete] = useState(null);
  const [transferListId, setTransferListId] = useState('');
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const { loading, error, clearError, runAsync } = useAsyncPageData();

  useEffect(() => {
    if (!boardId) {
      return;
    }

    runAsync(async () => {
      const boardData = await getBoard(boardId);

      setBoard(boardData);
      setActionError(null);
    }, { rethrow: false });
  }, [boardId, runAsync]);

  const handleArchiveBoard = useCallback(async () => {
    if (!board) return;
    if (!window.confirm(`Archive board "${board.title}"? It will be moved to Archived Boards.`)) return;
    try {
      await archiveBoard(board.id);
      dispatch({ type: actions.ARCHIVE_BOARD, payload: board });
      navigate('/boards');
    } catch (err) {
      setActionError(`Failed to archive board: ${getErrorMessage(err)}`);
    }
  }, [board, dispatch, actions, navigate]);

  const handleUnarchiveBoard = useCallback(async () => {
    if (!board) return;
    try {
      await unarchiveBoard(board.id);
      dispatch({
        type: actions.UNARCHIVE_BOARD,
        payload: { ...board, archived_at: null }
      });
      navigate('/boards');
    } catch (err) {
      setActionError(`Failed to unarchive board: ${getErrorMessage(err)}`);
    }
  }, [board, dispatch, actions, navigate]);

  const handleDeleteBoard = useCallback(async () => {
    if (!board) return;
    if (!window.confirm(`Permanently delete board "${board.title}"? This cannot be undone.`)) return;
    try {
      await deleteBoard(board.id);
      dispatch({ type: actions.DELETE_BOARD, payload: board.id });
      navigate('/boards');
    } catch (err) {
      setActionError(`Failed to delete board: ${getErrorMessage(err)}`);
    }
  }, [board, dispatch, actions, navigate]);

  const resetTitleEditState = useCallback(() => {
    setIsTitleEditing(false);
    setEditedTitle('');
  }, []);

  const handleTitleEditStart = useCallback(() => {
    if (!board) return;
    setEditedTitle(board.title);
    setIsTitleEditing(true);
  }, [board]);

  const handleTitleEditCancel = useCallback(() => {
    resetTitleEditState();
  }, [resetTitleEditState]);

  const handleTitleUpdate = useCallback(async () => {
    if (!board) return;

    const trimmedTitle = editedTitle.trim();

    if (!trimmedTitle || trimmedTitle === board.title) {
      resetTitleEditState();
      return;
    }

    try {
      const updatedBoard = await updateBoard(board.id, { title: trimmedTitle });
      setBoard(updatedBoard);
      dispatch({ type: actions.UPDATE_BOARD, payload: updatedBoard });
      resetTitleEditState();
      setActionError(null);
      clearError();
    } catch (err) {
      setActionError(`Failed to update board title: ${getErrorMessage(err)}`);
      resetTitleEditState();
    }
  }, [board, editedTitle, dispatch, actions, clearError, resetTitleEditState]);

  const handleCardClick = useCallback((card) => {
    setSelectedCard(card);
  }, []);

  const closeCardDetail = useCallback(() => {
    setSelectedCard(null);
  }, []);

  const handleCardUpdate = useCallback((updatedCard) => {
    setSelectedCard(updatedCard);
    setBoard(prev => prev ? {
      ...prev,
      lists: prev.lists.map(list => ({
        ...list,
        cards: list.cards?.map(card =>
          card.id === updatedCard.id ? { ...card, ...updatedCard } : card
        )
      }))
    } : prev);
  }, []);

  const handleCardDelete = useCallback(async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeletingCard(true);
      await deleteCard(cardId);
      setBoard((previousBoard) => (previousBoard ? removeCardFromBoard(previousBoard, cardId) : previousBoard));
      setSelectedCard((currentCard) => (currentCard?.id === cardId ? null : currentCard));
      setActionError(null);
      clearError();
    } catch (err) {
      setActionError(`Failed to delete card: ${getErrorMessage(err)}`);
    } finally {
      setIsDeletingCard(false);
    }
  }, [clearError]);

  const closeListDeleteModal = useCallback(() => {
    if (isDeletingList) {
      return;
    }

    setListPendingDelete(null);
    setTransferListId('');
  }, [isDeletingList]);

  const handleListDeleteConfirm = useCallback(async ({ listId, transferListId: nextTransferListId = '' }) => {
    const list = board?.lists?.find((candidate) => candidate.id === listId);

    if (!list) {
      return;
    }

    const parsedTransferListId = nextTransferListId ? Number(nextTransferListId) : null;
    const transferList = parsedTransferListId
      ? board.lists.find((candidate) => candidate.id === parsedTransferListId)
      : null;
    const hasCards = (list.cards || []).length > 0;

    const confirmationMessage = transferList
      ? `Are you sure you want to delete this list and move its cards to "${transferList.title}"? This action cannot be undone.`
      : hasCards
        ? 'Are you sure you want to delete this list? All cards in it will also be deleted. This action cannot be undone.'
        : 'Are you sure you want to delete this list? This action cannot be undone.';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      setIsDeletingList(true);
      await deleteList(listId, parsedTransferListId ? { transfer_list_id: parsedTransferListId } : undefined);
      setBoard((previousBoard) => (
        previousBoard
          ? removeListFromBoard(previousBoard, listId, parsedTransferListId)
          : previousBoard
      ));
      setSelectedCard((currentCard) => {
        if (!currentCard) {
          return currentCard;
        }

        if (currentCard.list_id !== listId) {
          return currentCard;
        }

        return parsedTransferListId
          ? { ...currentCard, list_id: parsedTransferListId }
          : null;
      });
      setActionError(null);
      clearError();
      setListPendingDelete(null);
      setTransferListId('');
    } catch (err) {
      setActionError(`Failed to delete list: ${getErrorMessage(err)}`);
    } finally {
      setIsDeletingList(false);
    }
  }, [board, clearError]);

  const handleListDeleteRequest = useCallback((list) => {
    const otherLists = board?.lists?.filter((candidate) => candidate.id !== list.id) || [];

    if ((list.cards || []).length > 0 && otherLists.length > 0) {
      setListPendingDelete(list);
      setTransferListId('');
      return;
    }

    void handleListDeleteConfirm({ listId: list.id });
  }, [board, handleListDeleteConfirm]);

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
    isDeletingCard,
    isDeletingList,
    selectedCard,
    listPendingDelete,
    transferListId,
    isTitleEditing,
    editedTitle,
    setNewListTitle,
    setTransferListId,
    setEditedTitle,
    handleDragStart,
    handleCardClick,
    handleArchiveBoard,
    handleUnarchiveBoard,
    handleDeleteBoard,
    handleTitleEditStart,
    handleTitleEditCancel,
    handleTitleUpdate,
    closeCardDetail,
    handleCardUpdate,
    handleCardDelete,
    handleCreateList,
    handleCardAdded,
    handleDragEnd,
    handleListDeleteRequest,
    handleListDeleteConfirm,
    closeListDeleteModal
  };
}
