import { useCallback, useState } from 'react';

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}

export default function useAsyncPageData({ initialLoading = true } = {}) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const runAsync = useCallback(async (operation, { clearPreviousError = true } = {}) => {
    try {
      setLoading(true);

      if (clearPreviousError) {
        setError(null);
      }

      return await operation();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
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
