import { useState, useEffect, useCallback } from 'react';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ConnectionMonitorConfig {
  checkInterval: number; // milliseconds
  timeout: number; // milliseconds
  maxRetries: number;
}

const DEFAULT_CONFIG: ConnectionMonitorConfig = {
  checkInterval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  maxRetries: 3,
};

export function useConnectionMonitor(config: Partial<ConnectionMonitorConfig> = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      setStatus('connecting');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);
      
      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setStatus('connected');
        setRetryCount(0);
        setLastChecked(new Date());
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('Connection check failed:', error);
      
      if (retryCount < finalConfig.maxRetries) {
        setRetryCount(prev => prev + 1);
        setStatus('connecting');
        return false;
      } else {
        setStatus('error');
        setRetryCount(0);
        return false;
      }
    }
  }, [finalConfig.timeout, finalConfig.maxRetries, retryCount]);

  const forceCheck = useCallback(() => {
    checkConnection();
  }, [checkConnection]);

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (status === 'disconnected') {
        forceCheck();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forceCheck, status]);

  // Periodic connection check
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      checkConnection();
    }, finalConfig.checkInterval);

    // Initial check
    checkConnection();

    return () => clearInterval(interval);
  }, [checkConnection, finalConfig.checkInterval, isOnline]);

  return {
    status,
    isOnline,
    lastChecked,
    retryCount,
    forceCheck,
  };
}