import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoardContext } from '../../context/BoardContext';
import { getArchivedBoards, deleteBoard, unarchiveBoard } from '../../services/api';
import EmptyState from '../../components/EmptyState';

export default function ArchivedBoardsIndex() {
  const { dispatch, actions } = useBoardContext();
  const [archivedBoards, setArchivedBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArchivedBoards() {
      try {
        setLoading(true);
        const boards = await getArchivedBoards();
        setArchivedBoards(boards);
      } catch (err) {
        setError('Failed to load archived boards');
      } finally {
        setLoading(false);
      }
    }
    loadArchivedBoards();
  }, []);

  const handleUnarchive = async (e, board) => {
    e.preventDefault(); // Prevent navigation
    try {
      await unarchiveBoard(board.id);
      dispatch({
        type: actions.UNARCHIVE_BOARD,
        payload: { ...board, archived_at: null }
      });
      setArchivedBoards(prev => prev.filter(b => b.id !== board.id));
    } catch (err) {
      setError('Failed to unarchive board');
    }
  };

  const handleDelete = async (e, board) => {
    e.preventDefault(); // Prevent navigation
    if (!window.confirm(`Permanently delete board "${board.title}"? This cannot be undone.`)) return;

    try {
      await deleteBoard(board.id);
      dispatch({ type: actions.DELETE_BOARD, payload: board.id });
      setArchivedBoards(prev => prev.filter(b => b.id !== board.id));
    } catch (err) {
      setError('Failed to delete board');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-zinc-500 text-lg animate-pulse">Loading archived boards...</div>
      </div>
    );
  }

  if (error && archivedBoards.length === 0) {
    return (
      <div className="py-6 h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Archived Boards</h1>
          <Link
            to="/boards"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Back to Boards
          </Link>
        </div>
        <EmptyState
          title="Error loading archived boards"
          message={error}
          icon={
            <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <Link
            to="/boards"
            className="inline-flex items-center rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            Back to Boards
          </Link>
        </EmptyState>
      </div>
    );
  }

  if (archivedBoards.length === 0) {
    return (
      <div className="py-6 h-[calc(100vh-100px)]">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Archived Boards</h1>
            <Link 
              to="/boards"
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Back to Boards
            </Link>
         </div>
        <EmptyState
          title="No archived boards"
          message="Boards you archive will appear here."
          icon={
            <svg className="w-16 h-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
        >
          <Link
            to="/boards"
            className="inline-flex items-center rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            Back to Boards
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Archived Boards</h1>
        <Link 
          to="/boards"
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Back to Boards
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {archivedBoards.map(board => (
          <Link
            key={board.id}
            to={`/boards/${board.id}`}
            data-testid="archived-board-card"
            className="group block h-40 p-6 bg-zinc-900/50 rounded-xl shadow-md border border-zinc-800 hover:border-zinc-600 relative overflow-hidden transition-colors"
          >
            <h2 className="text-xl font-bold text-zinc-400 mb-2 truncate">
              {board.title}
            </h2>
            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
              <p className="text-xs text-zinc-600">
                Archived {new Date(board.archived_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleUnarchive(e, board)}
                  className="p-1 text-zinc-400 hover:text-green-400 transition-colors"
                  title="Unarchive Board"
                  data-testid={`unarchive-board-${board.id}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDelete(e, board)}
                  className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Delete Permanently"
                  data-testid={`delete-board-${board.id}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
