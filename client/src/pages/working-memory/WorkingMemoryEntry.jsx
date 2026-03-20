import { useState } from 'react';

export default function WorkingMemoryEntry({ entry, onSendToBoard }) {
    const [hovered, setHovered] = useState(false);

    function formatDate(dateString) {
        return `${new Date(dateString).toLocaleDateString()} ${new Date(dateString).toLocaleTimeString()}`;
    }

    return (
        <div
            className="relative py-2"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={formatDate(entry.updated_at)}
            data-testid={`wm-entry-${entry.id}`}
        >
            {hovered && (
                <button
                    type="button"
                    onClick={() => onSendToBoard(entry)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-600"
                    aria-label="Send to board"
                    data-testid={`wm-entry-send-btn-${entry.id}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            )}
            <div className="pl-8">{entry.content}</div>
        </div>
    );
}
