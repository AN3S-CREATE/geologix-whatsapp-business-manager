import * as React from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useApi<T = any>(
  url: string | null,
  options: RequestInit & ApiOptions = {}
): ApiState<T> & { refetch: () => Promise<void>; reset: () => void } {
  const [state, setState] = React.useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const { retries = 3, retryDelay = 1000, timeout = 30000, ...fetchOptions } = options;

  const fetchData = React.useCallback(async () => {
    if (!url) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = (await response.text()) as unknown as T;
        }

        setState({ data, loading: false, error: null });
        return;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    setState({
      data: null,
      loading: false,
      error: lastError?.message || 'Failed to fetch data'
    });
  }, [url, retries, retryDelay, timeout, JSON.stringify(fetchOptions)]);

  const reset = React.useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
    reset
  };
}

export function useApiMutation<TData = any, TVariables = any>(): {
  mutate: (url: string, options?: RequestInit & ApiOptions & { variables?: TVariables }) => Promise<TData>;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mutate = React.useCallback(async (
    url: string, 
    options: RequestInit & ApiOptions & { variables?: TVariables } = {}
  ): Promise<TData> => {
    const { retries = 3, retryDelay = 1000, timeout = 30000, variables, ...fetchOptions } = options;

    setLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const body = variables ? JSON.stringify(variables) : fetchOptions.body;
        const headers = {
          'Content-Type': 'application/json',
          ...fetchOptions.headers
        };

        const response = await fetch(url, {
          method: 'POST',
          ...fetchOptions,
          headers,
          body,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: TData;

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = (await response.text()) as unknown as TData;
        }

        setLoading(false);
        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    const errorMessage = lastError?.message || 'Request failed';
    setError(errorMessage);
    setLoading(false);
    throw new Error(errorMessage);
  }, []);

  const reset = React.useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { mutate, loading, error, reset };
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}