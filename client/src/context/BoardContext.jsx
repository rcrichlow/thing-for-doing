import { createContext, useReducer, useContext } from 'react';

// Action types
const BOARD_ACTIONS = {
  SET_BOARDS: 'SET_BOARDS',
  ADD_BOARD: 'ADD_BOARD',
  UPDATE_BOARD: 'UPDATE_BOARD',
  DELETE_BOARD: 'DELETE_BOARD',
  
  SET_LISTS: 'SET_LISTS',
  ADD_LIST: 'ADD_LIST',
  UPDATE_LIST: 'UPDATE_LIST',
  DELETE_LIST: 'DELETE_LIST',
  
  SET_CARDS: 'SET_CARDS',
  ADD_CARD: 'ADD_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Initial state
const initialState = {
  boards: [],
  lists: [],
  cards: [],
  loading: false,
  error: null
};

// Reducer
function boardReducer(state, action) {
  switch (action.type) {
    // Board actions
    case BOARD_ACTIONS.SET_BOARDS:
      return { ...state, boards: action.payload, loading: false };
    
    case BOARD_ACTIONS.ADD_BOARD:
      return { ...state, boards: [...state.boards, action.payload] };
    
    case BOARD_ACTIONS.UPDATE_BOARD:
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id ? action.payload : board
        )
      };
    
    case BOARD_ACTIONS.DELETE_BOARD:
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload),
        lists: state.lists.filter(list => list.board_id !== action.payload),
        cards: state.cards.filter(card => {
          const list = state.lists.find(l => l.id === card.list_id);
          return !list || list.board_id !== action.payload;
        })
      };
    
    // List actions
    case BOARD_ACTIONS.SET_LISTS:
      return { ...state, lists: action.payload };
    
    case BOARD_ACTIONS.ADD_LIST:
      return { ...state, lists: [...state.lists, action.payload] };
    
    case BOARD_ACTIONS.UPDATE_LIST:
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.id ? action.payload : list
        )
      };
    
    case BOARD_ACTIONS.DELETE_LIST:
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload),
        cards: state.cards.filter(card => card.list_id !== action.payload)
      };
    
    // Card actions
    case BOARD_ACTIONS.SET_CARDS:
      return { ...state, cards: action.payload };
    
    case BOARD_ACTIONS.ADD_CARD:
      return { ...state, cards: [...state.cards, action.payload] };
    
    case BOARD_ACTIONS.UPDATE_CARD:
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload.id ? action.payload : card
        )
      };
    
    case BOARD_ACTIONS.DELETE_CARD:
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
    
    // Meta actions
    case BOARD_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case BOARD_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
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
