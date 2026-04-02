import React from 'react';
import Modal from '../../components/Modal';
import WorkingMemoryEntry from './WorkingMemoryEntry';
import SendToBoardModal from './SendToBoardModal';
import useWorkingMemoryState from '../../hooks/useWorkingMemoryState';

export default function WorkingMemoryView() {
    const {
        value,
        setValue,
        open,
        entries,
        sendToBoardEntry,
        isMultilineComposer,
        setSendToBoardEntry,
        inputRef,
        formRef,
        loading,
        error,
        closeModal,
        handleSubmit,
        handleInputKeyDown,
        handleClearEntries,
        handleDeleteEntry,
        handleUpdateEntry
    } = useWorkingMemoryState();

    return (
        <div className="space-y-6 py-2">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Working Memory</h1>
            <p className="text-zinc-400">Start typing anywhere</p>

            {loading && entries.length === 0 && (
                <div className="flex justify-center items-center h-64">
                    <div className="text-zinc-500 text-lg animate-pulse">Loading entries...</div>
                </div>
            )}

            {error && (
                <div className="mt-4 mb-4 p-4 bg-red-900/20 border-l-4 border-red-500 text-red-200 rounded shadow-sm">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
            <div>
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-zinc-200">Entries</h2>
                    <button
                        type="button"
                        onClick={handleClearEntries}
                        className="rounded-md bg-red-600/80 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                        aria-label="Clear all working memory entries"
                    >
                        Clear All
                    </button>
                </div>
                {entries.toReversed().map(entry => (
                    <WorkingMemoryEntry
                        key={entry.id}
                        entry={entry}
                        onSendToBoard={setSendToBoardEntry}
                        onDeleteEntry={handleDeleteEntry}
                        onUpdateEntry={handleUpdateEntry}
                    />
                ))}
            </div>
            )}

            <Modal
                isOpen={open}
                onClose={closeModal}
                title="New working memory entry"
                titleDescription="Press Enter to save, Shift+Enter for multiple lines, or Escape to close."
                data-testid="working-memory-modal"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="working-memory-form"
                            disabled={!value.trim()}
                            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Save entry
                        </button>
                    </>
                }
            >
                <form id="working-memory-form" ref={formRef} onSubmit={handleSubmit}>
                    {isMultilineComposer ? (
                        <textarea
                            ref={inputRef}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            onKeyDown={handleInputKeyDown}
                            rows={5}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                            placeholder="What are you thinking?"
                            data-testid="working-memory-modal-input"
                        />
                    ) : (
                        <input
                            type="text"
                            ref={inputRef}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            onKeyDown={handleInputKeyDown}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="What are you thinking?"
                            data-testid="working-memory-modal-input"
                        />
                    )}
                </form>
            </Modal>

            {sendToBoardEntry && (
                <SendToBoardModal
                    entry={sendToBoardEntry}
                    onClose={() => setSendToBoardEntry(null)}
                />
            )}
        </div>
    )
}
