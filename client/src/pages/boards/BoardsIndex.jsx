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
    handleCreateBoard
  } = useBoardsIndexState();

  if (loading && boards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg animate-pulse">Loading your boards...</div>
      </div>
    );
  }

  // Show EmptyState only if no boards AND not currently trying to create one
  if (boards.length === 0 && !isCreating) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl h-[calc(100vh-100px)]">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Boards</h1>
         </div>
        <EmptyState
          title="No boards yet"
          message="Create your first board to start organizing your tasks and ideas."
          icon={
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          }
        >
          <button
            onClick={() => setIsCreating(true)}
            data-testid="new-board-btn"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Board
          </button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Boards</h1>
      </div>

      {localError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
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
            className="group block h-40 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors truncate">
              {board.title}
            </h2>
            <p className="text-xs text-gray-400 mt-auto absolute bottom-4 left-6">
              Created {new Date(board.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}

        {/* Always show the create tile if we are in grid mode (either have boards or are creating one) */}
        <div className="h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col justify-center items-center p-4">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              data-testid="new-board-btn"
              className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 outline-none"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  data-testid="board-submit-btn"
                  disabled={!newBoardTitle.trim()}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewBoardTitle('');
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
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
