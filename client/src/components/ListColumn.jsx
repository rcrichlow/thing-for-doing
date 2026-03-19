import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createCard } from '../services/api';
import CardItem from './CardItem';

export default function ListColumn({ list, onCardAdded, onCardClick }) {
  const { setNodeRef } = useDroppable({
    id: list.id,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const card = await createCard(list.id, {
        title: newCardTitle,
        position: list.cards ? list.cards.length : 0
      });
      onCardAdded(list.id, card);
      setNewCardTitle('');
      setIsAdding(false);
    } catch (err) {
      setError(err.message || 'Failed to create card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleListChange = (newCardIds) => {
    console.log('changing list order: ', newCardIds);
  };

  const cardIds = list.cards ? list.cards.map(card => card.id) : [];

  return (
    <div
      ref={setNodeRef}
      data-testid="list-column"
      className="w-80 flex-shrink-0 bg-gray-100 rounded-lg shadow-sm border border-gray-200 flex flex-col max-h-full"
    >
      <div className="p-4 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h3>{list.title}</h3>
        <span className="text-xs text-gray-400 font-normal">{list.cards ? list.cards.length : 0} cards</span>
      </div>

      <div className="p-3 flex-1 overflow-y-auto min-h-0 space-y-3">
        <SortableContext onChange={handleListChange} items={cardIds} strategy={verticalListSortingStrategy}>
          {list.cards && list.cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick && onCardClick(card)}
            />
          ))}
        </SortableContext>
        {(!list.cards || list.cards.length === 0) && (
          <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            No cards yet
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        {isAdding ? (
          <form onSubmit={handleSubmit} className="bg-white p-3 rounded shadow-sm border border-gray-200">
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <input
              type="text"
              data-testid="card-title-input"
              autoFocus
              placeholder="Enter card title..."
              className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:border-blue-500"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            data-testid="add-card-btn"
            onClick={() => setIsAdding(true)}
            className="w-full text-left text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-2 py-1.5 rounded transition-colors text-sm flex items-center"
          >
            <span className="text-lg mr-2 leading-none">+</span> Add a card
          </button>
        )}
      </div>
    </div>
  );
}
