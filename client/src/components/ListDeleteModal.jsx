import Modal from './Modal';

export default function ListDeleteModal({
  list,
  availableLists,
  transferListId,
  onTransferListIdChange,
  onClose,
  onConfirm,
  isDeleting
}) {
  const cardCount = list.cards?.length || 0;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Delete list"
      titleDescription="Optionally move cards before deleting this list."
      data-testid="list-delete-modal"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ listId: list.id, transferListId })}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="confirm-delete-list-btn"
          >
            {isDeleting ? 'Deleting…' : 'Delete list'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <p className="text-sm text-zinc-300">
            <span className="font-semibold text-zinc-100">{list.title}</span> has {cardCount} {cardCount === 1 ? 'card' : 'cards'}.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Choose another list to keep those cards, or leave the selection empty to delete them with this list.
          </p>
        </div>

        <div>
          <label htmlFor="transfer-list" className="mb-2 block text-sm font-medium text-zinc-400">
            Transfer cards to
          </label>
          <select
            id="transfer-list"
            value={transferListId}
            onChange={(event) => onTransferListIdChange(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            data-testid="transfer-list-select"
          >
            <option value="">Don&apos;t transfer — delete cards</option>
            {availableLists.map((availableList) => (
              <option key={availableList.id} value={availableList.id}>
                {availableList.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
