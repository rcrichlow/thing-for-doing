import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import useBoardsIndexState from '../../hooks/useBoardsIndexState';

export default function BoardsIndex() {
  const {
    boards,
    newBoardTitle,
    setNewBoardTitle,
    localError,
    isCreating,
    setIsCreating,
    loading,
    handleCreateBoard,
    handleArchiveBoard
  } = useBoardsIndexState();

  if (loading && boards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-zinc-500 text-lg animate-pulse">Loading your boards...</div>
      </div>
    );
  }

  // Show EmptyState only if no boards AND not currently trying to create one
  if (boards.length === 0 && !isCreating) {
    return (
      <div className="py-6 h-[calc(100vh-100px)]">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Your Boards</h1>
            <Link 
              to="/boards/archived"
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Archived Boards
            </Link>
         </div>
        <EmptyState
          title="No boards yet"
          message="Create your first board to start organizing your tasks and ideas."
          icon={
            <svg className="w-16 h-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          }
        >
          <div className="flex gap-4">
            <button
              onClick={() => setIsCreating(true)}
              data-testid="new-board-btn"
              className="inline-flex items-center rounded-md border border-transparent bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Create New Board
            </button>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Your Boards</h1>
        <Link 
          to="/boards/archived"
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Archived Boards
        </Link>
      </div>

      {localError && (
        <div className="mb-6 p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded shadow-sm">
          <p className="font-medium">Error</p>
          <p>{localError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {boards.map(board => (
          <Link
            key={board.id}
            to={`/boards/${board.id}`}
            data-testid="board-card"
            className="group block h-40 p-6 bg-zinc-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-zinc-800 hover:border-violet-500 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200"></div>
            <h2 className="text-xl font-bold text-zinc-200 mb-2 group-hover:text-violet-400 transition-colors truncate pr-8">
              {board.title}
            </h2>
            <button
              onClick={(e) => handleArchiveBoard(e, board)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-500 hover:text-amber-400 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Archive Board"
              data-testid={`archive-board-${board.id}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <p className="text-xs text-zinc-500 mt-auto absolute bottom-4 left-6">
              Created {new Date(board.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}

        {/* Always show the create tile if we are in grid mode (either have boards or are creating one) */}
        <div className="h-40 bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-800 hover:border-violet-500 hover:bg-zinc-900 transition-colors flex flex-col justify-center items-center p-4">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              data-testid="new-board-btn"
              className="w-full h-full flex flex-col items-center justify-center text-zinc-500 outline-none transition-colors hover:text-violet-400"
            >
              <span className="text-4xl mb-2 font-light">+</span>
              <span className="font-medium">Create New Board</span>
            </button>
          ) : (
            <form onSubmit={handleCreateBoard} className="w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder="Board Title..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                data-testid="board-title-input"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-zinc-800 text-zinc-100 placeholder-zinc-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  data-testid="board-submit-btn"
                  disabled={!newBoardTitle.trim()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewBoardTitle('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
