import { useCallback, useEffect, useRef, useState } from 'react';
import { getWorkingMemoryEntries, createWorkingMemoryEntry, clearWorkingMemory } from '../services/api';
import useAsyncPageData from './useAsyncPageData';

export default function useWorkingMemoryState() {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [sendToBoardEntry, setSendToBoardEntry] = useState(null);
  const inputRef = useRef(null);
  const formRef = useRef(null);
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
      inputRef.current.focus();
      const cursorPosition = value.length;
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [open, value]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setValue('');
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
  }, [value]);

  const handleInputKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, []);

  const handleClearEntries = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all working memory entries? This action cannot be undone.')) {
      clearWorkingMemory()
        .then(() => setEntries([]))
        .catch(err => {
          console.error('Error clearing working memory:', err);
        });
    }
  }, []);

  return {
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
  };
}
