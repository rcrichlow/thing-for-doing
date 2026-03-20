/**
 * Reusable modal component — wraps the existing inline backdrop/dialog pattern.
 * Repurposed from WorkingMemoryView's entry composer.
 */
export default function Modal({ isOpen, onClose, title, titleDescription, children, footer, 'data-testid': testId }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700/50 px-4"
            onClick={onClose}
            data-testid={testId ? `${testId}-backdrop` : undefined}
        >
            <div
                className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={testId ? `${testId}-title` : undefined}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 id={testId ? `${testId}-title` : undefined} className="text-xl font-bold text-gray-900">
                            {title}
                        </h2>
                        {titleDescription && (
                            <p className="mt-1 text-sm text-gray-600">{titleDescription}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {children}

                {footer && (
                    <div className="mt-4 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
