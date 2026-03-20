import { useState } from 'react';
import Modal from './Modal';
import { updateCard } from '../services/api';

export default function CardDetailModal({ card, onClose, onUpdate, onDelete, isDeleting = false }) {
    const [titleEditing, setTitleEditing] = useState(false);
    const [descriptionEditing, setDescriptionEditing] = useState(false);
    const [title, setTitle] = useState(card.title || '');
    const [description, setDescription] = useState(card.description || '');
    const [saveError, setSaveError] = useState(null);

    async function save() {
        if (title === card.title && description === (card.description || '')) {
            return;
        }
        try {
            setSaveError(null);
            const updated = await updateCard(card.id, { title, description });
            onUpdate(updated);
        } catch (err) {
            setSaveError(err.message || 'Failed to save changes');
        }
    }

    function handleClose() {
        save();
        onClose();
    }

    return (
        <Modal
            isOpen={true}
            onClose={handleClose}
            title="Card details"
            footer={
                <>
                    <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onDelete(card.id)}
                        disabled={isDeleting}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        data-testid="card-detail-delete-btn"
                    >
                        {isDeleting ? 'Deleting…' : 'Delete card'}
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Done
                    </button>
                </>
            }
            data-testid="card-detail"
        >
            {saveError && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {saveError}
                </div>
            )}
            <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title
                </label>
                {titleEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => { save(); setTitleEditing(false); }}
                        autoFocus
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="card-detail-title-input"
                    />
                ) : (
                    <div
                        onClick={() => { setTitleEditing(true); setDescriptionEditing(false); }}
                        className="cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                        data-testid="card-detail-title-text"
                    >
                        {card.title || <span className="text-gray-400 italic">Click to add title</span>}
                    </div>
                )}
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                </label>
                {descriptionEditing ? (
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => { save(); setDescriptionEditing(false); }}
                        autoFocus
                        rows={5}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Add a description..."
                        data-testid="card-detail-description-input"
                    />
                ) : (
                    <div
                        onClick={() => { setDescriptionEditing(true); setTitleEditing(false); }}
                        className="cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-gray-100 min-h-[2rem]"
                        data-testid="card-detail-description-text"
                    >
                        {card.description || <span className="text-gray-400 italic">Click to add description</span>}
                    </div>
                )}
            </div>
        </Modal>
    );
}
