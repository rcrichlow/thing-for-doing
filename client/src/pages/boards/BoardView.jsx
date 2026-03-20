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
    setNewListTitle,
    setTransferListId,
    handleDragStart,
    handleCardClick,
    closeCardDetail,
    handleCardUpdate,
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
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-gray-500 text-lg animate-pulse">Loading board...</div>
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
       <Link to="/boards" className="text-blue-600 hover:text-blue-800 font-medium">Return to Boards</Link>
    </EmptyState>
  );

  if (!board) return (
    <EmptyState
      title="Board not found"
      message="The board you are looking for does not exist or has been deleted."
    >
      <Link to="/boards" className="text-blue-600 hover:text-blue-800 font-medium">Return to Boards</Link>
    </EmptyState>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
        <Link to="/boards" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          &larr; Back to Boards
        </Link>
      </div>

      {actionError && (
        <div className="px-6 pt-4">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm" role="alert">
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
              />
            ))}

            {/* Empty State for Board (No Lists) */}
            {(!board.lists || board.lists.length === 0) ? (
               <div className="w-full h-full flex items-center justify-center">
                 <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Start your workflow</h3>
                    <p className="text-gray-500 mb-6">Create your first list to start adding cards and tasks to this board.</p>
                    <form onSubmit={handleCreateList}>
                      <input
                        type="text"
                        data-testid="list-title-input"
                        placeholder="List Title (e.g. To Do)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="submit"
                        data-testid="add-list-btn"
                        disabled={isCreatingList || !newListTitle.trim()}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
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
                  className="bg-white bg-opacity-70 hover:bg-opacity-100 p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200"
                >
                  <input
                    type="text"
                    data-testid="list-title-input"
                    placeholder="Enter list title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                  <button
                    type="submit"
                    data-testid="add-list-btn"
                    disabled={isCreatingList || !newListTitle.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
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
