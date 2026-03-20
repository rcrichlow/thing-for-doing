import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getBoards, createBoard, createList, createCard } from '../../services/api';

const NEW_BOARD = '__new__';
const NEW_LIST = '__new__';

export default function SendToBoardModal({ entry, onClose }) {
    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState('');
    const [selectedListId, setSelectedListId] = useState('');
    const [creatingBoard, setCreatingBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const [creatingList, setCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getBoards().then(setBoards).catch(() => setError('Failed to load boards'));
    }, []);

    const selectedBoard = boards.find(b => String(b.id) === String(selectedBoardId));
    const lists = selectedBoard?.lists || [];

    async function handleCreateBoard() {
        if (!newBoardName.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const newBoard = await createBoard({ title: newBoardName.trim() });
            setBoards(prev => [...prev, newBoard]);
            setSelectedBoardId(String(newBoard.id));
            setNewBoardName('');
            setCreatingBoard(false);
            setSelectedListId('');
        } catch (err) {
            setError('Failed to create board');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateList() {
        if (!newListName.trim() || !selectedBoardId) return;
        setLoading(true);
        setError(null);
        try {
            const newList = await createList(selectedBoardId, { title: newListName.trim() });
            setBoards(prev => prev.map(b =>
                String(b.id) === String(selectedBoardId)
                    ? { ...b, lists: [...(b.lists || []), newList] }
                    : b
            ));
            setSelectedListId(String(newList.id));
            setNewListName('');
            setCreatingList(false);
        } catch (err) {
            setError('Failed to create list');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (!selectedListId) return;

        setLoading(true);
        setError(null);

        try {
            await createCard(selectedListId, { title: entry.content });
            onClose();
        } catch (err) {
            setError('Failed to create card');
        } finally {
            setLoading(false);
        }
    }

    function handleBoardChange(event) {
        const val = event.target.value;
        if (val === NEW_BOARD) {
            setSelectedBoardId('');
            setCreatingBoard(true);
            setSelectedListId('');
        } else {
            setSelectedBoardId(val);
            setCreatingBoard(false);
            setSelectedListId('');
        }
    }

    function handleListChange(event) {
        const val = event.target.value;
        if (val === NEW_LIST) {
            setSelectedListId('');
            setCreatingList(true);
        } else {
            setSelectedListId(val);
            setCreatingList(false);
        }
    }

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedListId || loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? 'Creating...' : 'Create card'}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Send to board"
            titleDescription="Choose a board and list to create a card."
            footer={footer}
            data-testid="send-to-board"
        >
            <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                <span className="font-medium text-gray-900">Entry: </span>
                {entry.content}
            </div>

            <div id="send-to-board-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="mb-4">
                    <label htmlFor="board-select" className="mb-1 block text-sm font-medium text-gray-700">
                        Board
                    </label>
                    <select
                        id="board-select"
                        value={creatingBoard ? '' : selectedBoardId}
                        onChange={handleBoardChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="send-to-board-board-select"
                    >
                        <option value="">Select a board</option>
                        {boards.map(board => (
                            <option key={board.id} value={board.id}>
                                {board.title}
                            </option>
                        ))}
                        <option value={NEW_BOARD}>+ Create new board</option>
                    </select>

                    {creatingBoard && (
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateBoard(); } }}
                                placeholder="New board name"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                data-testid="send-to-board-new-board-input"
                            />
                            <button
                                type="button"
                                onClick={handleCreateBoard}
                                disabled={!newBoardName.trim() || loading}
                                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCreatingBoard(false); setNewBoardName(''); }}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="list-select" className="mb-1 block text-sm font-medium text-gray-700">
                        List
                    </label>
                    <select
                        id="list-select"
                        value={creatingList ? '' : selectedListId}
                        onChange={handleListChange}
                        disabled={!selectedBoardId}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                        data-testid="send-to-board-list-select"
                    >
                        <option value="">Select a list</option>
                        {lists.map(list => (
                            <option key={list.id} value={list.id}>
                                {list.title}
                            </option>
                        ))}
                        <option value={NEW_LIST} disabled={!selectedBoardId}>+ Create new list</option>
                    </select>

                    {creatingList && (
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateList(); } }}
                                placeholder="New list name"
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                data-testid="send-to-board-new-list-input"
                            />
                            <button
                                type="button"
                                onClick={handleCreateList}
                                disabled={!newListName.trim() || loading}
                                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCreatingList(false); setNewListName(''); }}
                                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-sm text-red-600" data-testid="send-to-board-error">{error}</p>
                )}
            </div>
        </Modal>
    );
}
