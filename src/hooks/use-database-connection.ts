import { useState, useCallback, useEffect } from 'react';

interface UseDatabaseConnectionReturn {
  isConnecting: boolean;
  connectionError: string | null;
  retryConnection: () => Promise<boolean>;
  handleFetchError: (error: unknown) => Promise<boolean>;
}

export function useDatabaseConnection(): UseDatabaseConnectionReturn {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const retryConnection = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Test the connection by making a simple API call
      const response = await fetch('/api/health-check');
      
      if (!response.ok) {
        throw new Error('Database connection failed');
      }

      setConnectionError(null);
      setRetryCount(0);
      return true;
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect to database');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Handle any fetch error and attempt to recover
  const handleFetchError = useCallback(async (error: unknown): Promise<boolean> => {
    if (retryCount >= MAX_RETRIES) {
      setConnectionError('Maximum retry attempts reached. Please try again later.');
      return false;
    }

    setRetryCount(prev => prev + 1);
    setIsConnecting(true);
    setConnectionError('Connection lost. Attempting to reconnect...');

    // Wait for the specified delay before retrying
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

    const success = await retryConnection();
    if (!success) {
      setConnectionError(`Connection failed (Attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying...`);
    }
    return success;
  }, [retryCount, retryConnection]);

  // Reset retry count when component unmounts or when connection is successful
  useEffect(() => {
    return () => {
      setRetryCount(0);
    };
  }, []);

  return {
    isConnecting,
    connectionError,
    retryConnection,
    handleFetchError,
  };
} 