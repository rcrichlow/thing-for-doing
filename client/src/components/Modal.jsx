import React, { useEffect } from 'react';

/**
 * Reusable modal component — wraps the existing inline backdrop/dialog pattern.
 * Repurposed from WorkingMemoryView's entry composer.
 */
export default function Modal({ isOpen, onClose, title, titleDescription, children, footer, 'data-testid': testId }) {
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={onClose}
            data-testid={testId ? `${testId}-backdrop` : undefined}
        >
            <div
                className="w-full max-w-xl rounded-xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={testId ? `${testId}-title` : undefined}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 id={testId ? `${testId}-title` : undefined} className="text-xl font-bold text-zinc-100 tracking-tight">
                            {title}
                        </h2>
                        {titleDescription && (
                            <p className="mt-1 text-sm text-zinc-400">{titleDescription}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {children}

                {footer && (
                    <div className="mt-6 flex justify-end gap-3 border-t border-zinc-800 pt-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
