
import { useEffect } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  dataSize: number;
}

export const usePortfolioPerformance = (
  componentName: string,
  dataSize: number = 0
) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${componentName}]:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          dataSize,
          itemsPerMs: dataSize > 0 ? (dataSize / renderTime).toFixed(2) : 'N/A'
        });
        
        // Warn if render time is too long
        if (renderTime > 100) {
          console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  }, [componentName, dataSize]);
};

export const useQueryPerformance = (queryKey: string, dataLength?: number) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && dataLength !== undefined) {
      console.log(`Query Performance [${queryKey}]:`, {
        itemCount: dataLength,
        timestamp: new Date().toISOString()
      });
    }
  }, [queryKey, dataLength]);
};
