import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import CardDetailModal from '../../components/CardDetailModal';
import ListDeleteModal from '../../components/ListDeleteModal';
import { StaticCardItem } from '../../components/CardItem';
import ListColumn from '../../components/ListColumn';
import EmptyState from '../../components/EmptyState';
import useBoardViewState from '../../hooks/useBoardViewState';

export default function BoardView() {
  const { id } = useParams();
  const {
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
    handleListUpdated,
    handleCardDelete,
    handleCreateList,
    handleCardAdded,
    handleDragEnd,
    handleListDeleteRequest,
    handleListDeleteConfirm,
    closeListDeleteModal
  } = useBoardViewState(id);

  const availableTransferLists = board?.lists?.filter((list) => list.id !== listPendingDelete?.id) || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="text-zinc-500 text-lg animate-pulse">Loading board...</div>
    </div>
  );

  if (error) return (
    <EmptyState
      title="Error loading board"
      message={error}
      icon={
        <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    >
      <Link to="/boards" className="font-medium text-violet-400 transition-colors hover:text-violet-300">Return to Boards</Link>
    </EmptyState>
  );

  if (!board) return (
    <EmptyState
      title="Board not found"
      message="The board you are looking for does not exist or has been deleted."
    >
      <Link to="/boards" className="font-medium text-violet-400 transition-colors hover:text-violet-300">Return to Boards</Link>
    </EmptyState>
  );

  const isArchived = !!board.archived_at;

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Archived Banner */}
      {isArchived && (
        <div className="bg-amber-900/30 border-b border-amber-900/50 px-6 py-2 text-center text-amber-200 text-sm flex items-center justify-center gap-4">
          <span>This board is archived.</span>
          <button
            onClick={handleUnarchiveBoard}
            className="text-amber-100 font-medium underline hover:text-green-300"
            data-testid="unarchive-board-btn"
          >
            Unarchive
          </button>
          <button
            onClick={handleDeleteBoard}
            className="text-amber-100 font-medium underline hover:text-red-300"
          >
            Delete Permanently
          </button>
        </div>
      )}

      {/* Board Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isTitleEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleUpdate();
                } else if (e.key === 'Escape') {
                  handleTitleEditCancel();
                }
              }}
              autoFocus
              className="text-2xl font-bold bg-zinc-800 text-zinc-100 px-3 py-1 rounded focus:outline-none outline outline-1 outline-zinc-700 focus:outline-2 focus:outline-violet-500"
              data-testid="board-title-input"
            />
          ) : (
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <button
                type="button"
                className="flex items-center cursor-pointer transition-colors px-3 py-1 bg-transparent border-0 text-2xl font-bold text-zinc-100 rounded"
                onClick={handleTitleEditStart}
                title="Edit board title"
              >
                {board.title}
              </button>
              {isArchived && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">Archived</span>}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!isArchived && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleArchiveBoard}
                className="text-zinc-400 hover:text-zinc-200 text-sm font-medium px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                title="Archive Board"
              >
                Archive
              </button>
              <button
                onClick={handleDeleteBoard}
                className="text-zinc-400 hover:text-red-400 text-sm font-medium px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors"
                title="Delete Board"
              >
                Delete
              </button>
              <div className="h-4 w-px bg-zinc-700"></div>
            </div>
          )}
          <Link to={isArchived ? "/boards/archived" : "/boards"} className="text-violet-400 hover:text-violet-300 text-sm font-medium">
            &larr; {isArchived ? "Back to Archived" : "Back to Boards"}
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="px-6 pt-4">
          <div className="p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded shadow-sm" role="alert">
            <p className="font-medium">Error</p>
            <p>{actionError}</p>
          </div>
        </div>
      )}

      {/* Board Content (Horizontal Scrolling) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className="flex h-full gap-6">
            {/* Lists */}
            {board.lists && board.lists.map(list => (
              <ListColumn
                key={list.id}
                list={list}
                onCardAdded={handleCardAdded}
                onCardClick={handleCardClick}
                onDeleteList={handleListDeleteRequest}
                onListUpdated={handleListUpdated}
              />
            ))}

            {/* Empty State for Board (No Lists) */}
            {(!board.lists || board.lists.length === 0) ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-800 text-center max-w-md">
                  <div className="mx-auto w-16 h-16 bg-violet-900/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100 mb-2">Start your workflow</h3>
                  <p className="text-zinc-400 mb-6">Create your first list to start adding cards and tasks to this board.</p>
                  <form onSubmit={handleCreateList}>
                    <input
                      type="text"
                      data-testid="list-title-input"
                      placeholder="List Title (e.g. To Do)"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-zinc-500"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      data-testid="add-list-btn"
                      disabled={isCreatingList || !newListTitle.trim()}
                      className="w-full bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50 font-medium"
                    >
                      {isCreatingList ? 'Creating...' : 'Create List'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Add List Section (Sidebar style when lists exist) */
              <div className="w-80 flex-shrink-0">
                <form
                  onSubmit={handleCreateList}
                  className="bg-zinc-900 bg-opacity-70 hover:bg-opacity-100 p-4 rounded-lg shadow-sm border border-zinc-800 transition-all duration-200"
                >
                  <input
                    type="text"
                    data-testid="list-title-input"
                    placeholder="Enter list title..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder-zinc-500"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                  <button
                    type="submit"
                    data-testid="add-list-btn"
                    disabled={isCreatingList || !newListTitle.trim()}
                    className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-500 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                  >
                    {isCreatingList ? 'Creating...' : 'Add List'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        <DragOverlay>
          {activeDragCard ? (
            <div className="w-72 pointer-events-none">
              <StaticCardItem card={activeDragCard} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={closeCardDetail}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
          isDeleting={isDeletingCard}
        />
      )}

      {listPendingDelete && (
        <ListDeleteModal
          list={listPendingDelete}
          availableLists={availableTransferLists}
          transferListId={transferListId}
          onTransferListIdChange={setTransferListId}
          onClose={closeListDeleteModal}
          onConfirm={handleListDeleteConfirm}
          isDeleting={isDeletingList}
        />
      )}
    </div>
  );
}
