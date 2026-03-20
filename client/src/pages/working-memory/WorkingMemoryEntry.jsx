import { useEffect, useRef, useState } from 'react';
import insertTextAtSelection from '../../utils/insertTextAtSelection';

export default function WorkingMemoryEntry({ entry, onSendToBoard, onDeleteEntry, onUpdateEntry }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isMultiline, setIsMultiline] = useState(false);
    const [draftContent, setDraftContent] = useState(entry.content);
    const [saveError, setSaveError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef(null);
    const pendingCursorPositionRef = useRef(null);
    const skipBlurSaveRef = useRef(false);

    useEffect(() => {
        setDraftContent(entry.content);
    }, [entry.content]);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        inputRef.current?.focus();

        const cursorPosition = pendingCursorPositionRef.current;

        if (cursorPosition != null) {
            inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
            pendingCursorPositionRef.current = null;
            return;
        }

        const cursorPositionAtEnd = draftContent.length;
        inputRef.current?.setSelectionRange(cursorPositionAtEnd, cursorPositionAtEnd);
    }, [draftContent, isEditing, isMultiline]);

    function formatDate(dateString) {
        return `${new Date(dateString).toLocaleDateString()} ${new Date(dateString).toLocaleTimeString()}`;
    }

    function startEditing() {
        setDraftContent(entry.content);
        setSaveError(null);
        setIsMultiline(entry.content.includes('\n'));
        setIsEditing(true);
    }

    function cancelEditing() {
        setDraftContent(entry.content);
        setSaveError(null);
        setIsMultiline(false);
        setIsEditing(false);
        pendingCursorPositionRef.current = null;
    }

    async function save() {
        const trimmedContent = draftContent.trim();

        if (!trimmedContent) {
            setDraftContent(entry.content);
            setSaveError(null);
            setIsMultiline(false);
            setIsEditing(false);
            return;
        }

        if (trimmedContent === entry.content) {
            setSaveError(null);
            setIsMultiline(false);
            setIsEditing(false);
            return;
        }

        try {
            setIsSaving(true);
            setSaveError(null);
            await onUpdateEntry(entry.id, trimmedContent);
            setIsMultiline(false);
            setIsEditing(false);
        } catch (err) {
            setSaveError(err.message || 'Failed to save entry');
        } finally {
            setIsSaving(false);
        }
    }

    function handleInputKeyDown(event) {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            skipBlurSaveRef.current = true;

            const { nextValue, cursorPosition } = insertTextAtSelection(draftContent, event.currentTarget, '\n');
            pendingCursorPositionRef.current = cursorPosition;
            setDraftContent(nextValue);
            setIsMultiline(true);
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            void save();
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            cancelEditing();
        }
    }

    function handleBlur() {
        if (skipBlurSaveRef.current) {
            skipBlurSaveRef.current = false;
            return;
        }

        void save();
    }

    return (
        <div className="py-1" data-testid={`wm-entry-${entry.id}`}>
            {saveError && (
                <div className="mb-1 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700" role="alert">
                    {saveError}
                </div>
            )}
            <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    disabled={isEditing || isSaving}
                    className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                    aria-label="Delete entry"
                    data-testid={`wm-entry-delete-btn-${entry.id}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12m-9 0V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v11m4-11v11m5-11v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => onSendToBoard(entry)}
                    disabled={isEditing || isSaving}
                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-600"
                    aria-label="Send to board"
                    data-testid={`wm-entry-send-btn-${entry.id}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
            <div className="min-w-0 flex-1" title={formatDate(entry.updated_at)}>
                {isEditing ? (
                    isMultiline ? (
                        <textarea
                            ref={inputRef}
                            value={draftContent}
                            onChange={(event) => setDraftContent(event.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleInputKeyDown}
                            disabled={isSaving}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 resize-none"
                            data-testid={`wm-entry-input-${entry.id}`}
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            value={draftContent}
                            onChange={(event) => setDraftContent(event.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleInputKeyDown}
                            disabled={isSaving}
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                            data-testid={`wm-entry-input-${entry.id}`}
                        />
                    )
                ) : (
                    <button
                        type="button"
                        onClick={startEditing}
                        className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100 whitespace-pre-wrap break-words"
                        data-testid={`wm-entry-content-btn-${entry.id}`}
                    >
                        {entry.content}
                    </button>
                )}
            </div>
            </div>
        </div>
    );
}
