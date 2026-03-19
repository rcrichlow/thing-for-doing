export default function BoardCardDetailDrawer({
  selectedCard,
  onClose
}) {
  if (!selectedCard) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-white w-96 h-full shadow-lg transform transition-transform duration-300 ease-in-out p-6 overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{selectedCard.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close details"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md min-h-[4rem]">
            {selectedCard.description || <span className="text-gray-400 italic">No description provided</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
