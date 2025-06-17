
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  apiCallCount: number;
  slowQueries: string[];
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiCallCount: 0,
    slowQueries: [],
  });
  
  const startTime = useRef<number>(performance.now());
  const renderStartTime = useRef<number>(performance.now());
  const apiCallCount = useRef<number>(0);
  const slowQueries = useRef<string[]>([]);

  useEffect(() => {
    const loadTime = performance.now() - startTime.current;
    setMetrics(prev => ({ ...prev, loadTime }));
  }, []);

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  });

  const trackApiCall = (queryName: string, duration: number) => {
    apiCallCount.current++;
    
    if (duration > 1000) { // Mark queries over 1 second as slow
      slowQueries.current.push(`${queryName}: ${duration.toFixed(2)}ms`);
    }
    
    setMetrics(prev => ({
      ...prev,
      apiCallCount: apiCallCount.current,
      slowQueries: [...slowQueries.current],
    }));
  };

  const getMemoryUsage = () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return {
        used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
        total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576), // MB
      };
    }
    return null;
  };

  const logPerformanceWarnings = () => {
    const warnings: string[] = [];
    
    if (metrics.loadTime > 2000) {
      warnings.push(`Slow load time: ${metrics.loadTime.toFixed(2)}ms`);
    }
    
    if (metrics.renderTime > 100) {
      warnings.push(`Slow render: ${metrics.renderTime.toFixed(2)}ms`);
    }
    
    if (metrics.slowQueries.length > 0) {
      warnings.push(`Slow queries detected: ${metrics.slowQueries.length}`);
    }
    
    if (warnings.length > 0) {
      console.warn(`[${componentName}] Performance warnings:`, warnings);
    }
  };

  useEffect(() => {
    const timer = setTimeout(logPerformanceWarnings, 5000);
    return () => clearTimeout(timer);
  }, [metrics]);

  return {
    metrics: {
      ...metrics,
      memoryUsage: getMemoryUsage(),
    },
    trackApiCall,
    reset: () => {
      startTime.current = performance.now();
      renderStartTime.current = performance.now();
      apiCallCount.current = 0;
      slowQueries.current = [];
      setMetrics({
        loadTime: 0,
        renderTime: 0,
        apiCallCount: 0,
        slowQueries: [],
      });
    },
  };
};
