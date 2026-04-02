import React, { createContext, useReducer, useContext } from 'react';

// Action types
const BOARD_ACTIONS = {
  SET_BOARDS: 'SET_BOARDS',
  ADD_BOARD: 'ADD_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  ARCHIVE_BOARD: 'ARCHIVE_BOARD',
  UNARCHIVE_BOARD: 'UNARCHIVE_BOARD',
  DELETE_BOARD: 'DELETE_BOARD'
};

function addOrUpdateBoard(boards, nextBoard) {
  const existingBoardIndex = boards.findIndex((board) => board.id === nextBoard.id);

  if (existingBoardIndex === -1) {
    return [...boards, nextBoard];
  }

  return boards.map((board) => (
    board.id === nextBoard.id ? nextBoard : board
  ));
}

function getBoardId(payload) {
  return typeof payload === 'object' && payload !== null ? payload.id : payload;
}

// Initial state
const initialState = {
  boards: []
};

// Reducer
function boardReducer(state, action) {
  switch (action.type) {
    case BOARD_ACTIONS.SET_BOARDS:
      return { ...state, boards: action.payload };
    
    case BOARD_ACTIONS.ADD_BOARD:
      return { ...state, boards: [...state.boards, action.payload] };
    
    case BOARD_ACTIONS.UPDATE_BOARD:
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id ? action.payload : board
        )
      };

    case BOARD_ACTIONS.ARCHIVE_BOARD:
      return {
        ...state,
        boards: state.boards.filter((board) => board.id !== getBoardId(action.payload))
      };

    case BOARD_ACTIONS.UNARCHIVE_BOARD:
      return {
        ...state,
        boards: addOrUpdateBoard(state.boards, action.payload)
      };

    case BOARD_ACTIONS.DELETE_BOARD:
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== getBoardId(action.payload))
      };
    
    default:
      return state;
  }
}

// Context
const BoardContext = createContext(null);

// Provider component
export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  return (
    <BoardContext.Provider value={{ state, dispatch, actions: BOARD_ACTIONS }}>
      {children}
    </BoardContext.Provider>
  );
}

// Custom hook for consuming context
export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}
