import { useCallback, useState } from 'react';
import getErrorMessage from '../utils/getErrorMessage';

export default function useAsyncPageData({ initialLoading = true } = {}) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const runAsync = useCallback(async (operation, { clearPreviousError = true, rethrow = true } = {}) => {
    try {
      setLoading(true);

      if (clearPreviousError) {
        setError(null);
      }

      return await operation();
    } catch (err) {
      setError(getErrorMessage(err));
      if (rethrow) throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    clearError,
    runAsync
  };
}
