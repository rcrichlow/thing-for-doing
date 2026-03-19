import { useState, useEffect, useRef } from 'react';
import { getWorkingMemoryEntries, createWorkingMemoryEntry, clearWorkingMemory } from '../../services/api';

export default function WorkingMemoryView() {
    const [value, setValue] = useState('');
    const [open, setOpen] = useState(false);
    const [entries, setEntries] = useState([]);
    const inputRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => { getWorkingMemoryEntries().then(entries => setEntries(entries)); }, []);

    useEffect(() => {
        function handleKeyDown(event) {
            if (open) {
                return;
            }

            const el = document.activeElement;
            const isTypingForm = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
            const isModifiedKeyPress = event.ctrlKey || event.metaKey || event.altKey;

            if (!isTypingForm && !isModifiedKeyPress && event.key.length === 1 && event.key.trim().length > 0) {
                setOpen(true);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    useEffect(() => {
        if (open) {
            inputRef.current.focus();
            const cursorPosition = value.length;
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [open, value]);

    function closeModal() {
        setOpen(false);
        setValue('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            return;
        }

        const entry = await createWorkingMemoryEntry({ content: trimmedValue });
        setEntries(currentEntries => [...currentEntries, entry]);
        closeModal();
    }

    function handleInputKeyDown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            formRef.current?.requestSubmit();
        }
    }

    function handleClearEntries() {
        if (window.confirm('Are you sure you want to clear all working memory entries? This action cannot be undone.')) {
            clearWorkingMemory()
                .then(() => setEntries([]))
                .catch(error => {
                    console.error('Error clearing working memory:', error);
                });
        }
    }

    function getEntryTitle(entry) {
        return `${new Date(entry.updated_at).toLocaleDateString()} ${new Date(entry.updated_at).toLocaleTimeString()}`;
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Working Memory</h1>
            <p className="text-gray-600">Start typing anywhere</p>
            <div>
                <div className="mt-6 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Entries</h2>
                    <button
                        type="button"
                        onClick={handleClearEntries}
                        className="rounded-md p-2 text-white bg-red-500 transition-colors"
                        aria-label="Clear all working memory entries"
                    >
                        Clear All
                    </button>
                </div>
                {entries.toReversed().map(entry => (
                    <div key={entry.id} title={getEntryTitle(entry)}>
                         {entry.content}
                    </div>
                ))}
            </div>

            {open ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700/50 px-4"
                    onClick={closeModal}
                    data-testid="working-memory-modal-backdrop"
                >
                    <div
                        className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="working-memory-modal-title"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 id="working-memory-modal-title" className="text-xl font-bold text-gray-900">New working memory entry</h2>
                                <p className="mt-1 text-sm text-gray-600">Press Enter to save or Escape to close.</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Close working memory composer"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form ref={formRef} onSubmit={handleSubmit}>
                            <input
                                type="text"
                                ref={inputRef}
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                onKeyDown={handleInputKeyDown}
                                className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="What are you thinking?"
                                data-testid="working-memory-modal-input"
                            />
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!value.trim()}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Save entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
