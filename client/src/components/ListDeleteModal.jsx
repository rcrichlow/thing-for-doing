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
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{list.title}</span> has {cardCount} {cardCount === 1 ? 'card' : 'cards'}.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Choose another list to keep those cards, or leave the selection empty to delete them with this list.
          </p>
        </div>

        <div>
          <label htmlFor="transfer-list" className="mb-2 block text-sm font-medium text-gray-700">
            Transfer cards to
          </label>
          <select
            id="transfer-list"
            value={transferListId}
            onChange={(event) => onTransferListIdChange(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
