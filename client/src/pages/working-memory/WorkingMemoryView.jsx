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
        setSendToBoardEntry,
        inputRef,
        formRef,
        loading,
        error,
        closeModal,
        handleSubmit,
        handleInputKeyDown,
        handleClearEntries
    } = useWorkingMemoryState();

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Working Memory</h1>
            <p className="text-gray-600">Start typing anywhere</p>

            {loading && entries.length === 0 && (
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500 text-lg animate-pulse">Loading entries...</div>
                </div>
            )}

            {error && (
                <div className="mt-4 mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
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
                    <WorkingMemoryEntry
                        key={entry.id}
                        entry={entry}
                        onSendToBoard={setSendToBoardEntry}
                    />
                ))}
            </div>
            )}

            <Modal
                isOpen={open}
                onClose={closeModal}
                title="New working memory entry"
                titleDescription="Press Enter to save or Escape to close."
                data-testid="working-memory-modal"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="working-memory-form"
                            disabled={!value.trim()}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Save entry
                        </button>
                    </>
                }
            >
                <form id="working-memory-form" ref={formRef} onSubmit={handleSubmit}>
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
