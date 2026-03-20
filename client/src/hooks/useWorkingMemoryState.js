import { useCallback, useEffect, useRef, useState } from 'react';
import { getWorkingMemoryEntries, createWorkingMemoryEntry, updateWorkingMemoryEntry, deleteWorkingMemoryEntry, clearWorkingMemory } from '../services/api';
import useAsyncPageData from './useAsyncPageData';
import insertTextAtSelection from '../utils/insertTextAtSelection';

export default function useWorkingMemoryState() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [sendToBoardEntry, setSendToBoardEntry] = useState(null);
  const [isMultilineComposer, setIsMultilineComposer] = useState(false);
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const pendingCursorPositionRef = useRef(null);
  const { loading, error, runAsync } = useAsyncPageData();

  useEffect(() => {
    runAsync(async () => {
      const data = await getWorkingMemoryEntries();
      setEntries(data);
    }, { rethrow: false });
  }, [runAsync]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (open || sendToBoardEntry) {
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
  }, [open, sendToBoardEntry]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();

      const cursorPosition = pendingCursorPositionRef.current ?? value.length;
      inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      pendingCursorPositionRef.current = null;
    }
  }, [open, value, isMultilineComposer]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setValue('');
    setIsMultilineComposer(false);
    pendingCursorPositionRef.current = null;
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    const entry = await createWorkingMemoryEntry({ content: trimmedValue });
    setEntries(currentEntries => [...currentEntries, entry]);
    setOpen(false);
    setValue('');
    setIsMultilineComposer(false);
    pendingCursorPositionRef.current = null;
  }, [value]);

  const handleInputKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();

      const { nextValue, cursorPosition } = insertTextAtSelection(value, event.currentTarget, '\n');
      pendingCursorPositionRef.current = cursorPosition;
      setValue(nextValue);
      setIsMultilineComposer(true);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, [value]);

  const handleClearEntries = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all working memory entries? This action cannot be undone.')) {
      clearWorkingMemory()
        .then(() => setEntries([]))
        .catch(err => {
          console.error('Error clearing working memory:', err);
        });
    }
  }, []);

  const handleDeleteEntry = useCallback((entryId) => {
    if (window.confirm('Are you sure you want to delete this working memory entry? This action cannot be undone.')) {
      deleteWorkingMemoryEntry(entryId)
        .then(() => {
          setEntries(currentEntries => currentEntries.filter(entry => entry.id !== entryId));
        })
        .catch(err => {
          console.error('Error deleting working memory entry:', err);
        });
    }
  }, []);

  const handleUpdateEntry = useCallback(async (entryId, content) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return null;
    }

    const updatedEntry = await updateWorkingMemoryEntry(entryId, { content: trimmedContent });

    setEntries((currentEntries) => currentEntries.map((entry) => (
      entry.id === entryId ? updatedEntry : entry
    )));

    return updatedEntry;
  }, []);

  return {
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
  };
}
