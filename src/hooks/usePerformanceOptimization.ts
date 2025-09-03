import { useCallback, useMemo, useRef, useEffect } from 'react';
import { type Node, type Edge } from '@xyflow/react';

// Performance optimization hooks for MindForge

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return func(...args);
    }
  }, [func, delay]) as T;
};

export const useVirtualization = (
  nodes: Node[],
  edges: Edge[],
  viewportBounds: { x: number; y: number; width: number; height: number }
) => {
  return useMemo(() => {
    // Only render nodes within the viewport plus a buffer
    const buffer = 200;
    const visibleNodes = nodes.filter(node => {
      return (
        node.position.x + buffer > viewportBounds.x &&
        node.position.x - buffer < viewportBounds.x + viewportBounds.width &&
        node.position.y + buffer > viewportBounds.y &&
        node.position.y - buffer < viewportBounds.y + viewportBounds.height
      );
    });

    // Only render edges connected to visible nodes
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );

    return { visibleNodes, visibleEdges };
  }, [nodes, edges, viewportBounds]);
};

export const useNodeClustering = (nodes: Node[], threshold: number = 100) => {
  return useMemo(() => {
    if (nodes.length < threshold) return { clusters: [nodes], shouldCluster: false };

    // Simple clustering algorithm based on proximity
    const clusters: Node[][] = [];
    const processed = new Set<string>();

    nodes.forEach(node => {
      if (processed.has(node.id)) return;

      const cluster = [node];
      processed.add(node.id);

      // Find nearby nodes
      nodes.forEach(otherNode => {
        if (processed.has(otherNode.id)) return;

        const distance = Math.sqrt(
          Math.pow(node.position.x - otherNode.position.x, 2) +
          Math.pow(node.position.y - otherNode.position.y, 2)
        );

        if (distance < 150) { // Cluster threshold distance
          cluster.push(otherNode);
          processed.add(otherNode.id);
        }
      });

      clusters.push(cluster);
    });

    return { clusters, shouldCluster: true };
  }, [nodes, threshold]);
};

export const useMemoizedCalculations = () => {
  const calculationCache = useRef(new Map());

  const memoizedCalculate = useCallback((key: string, calculation: () => any) => {
    if (calculationCache.current.has(key)) {
      return calculationCache.current.get(key);
    }

    const result = calculation();
    calculationCache.current.set(key, result);

    // Clear cache after some time to prevent memory leaks
    setTimeout(() => {
      calculationCache.current.delete(key);
    }, 30000);

    return result;
  }, []);

  return { memoizedCalculate };
};

export const useAsyncQueue = () => {
  const queue = useRef<Array<() => Promise<void>>>([]);
  const isProcessing = useRef(false);

  const addToQueue = useCallback(async (asyncOperation: () => Promise<void>) => {
    queue.current.push(asyncOperation);
    
    if (!isProcessing.current) {
      isProcessing.current = true;
      
      while (queue.current.length > 0) {
        const operation = queue.current.shift();
        if (operation) {
          try {
            await operation();
          } catch (error) {
            console.error('Queue operation failed:', error);
          }
        }
      }
      
      isProcessing.current = false;
    }
  }, []);

  return { addToQueue };
};

import { useState } from 'react';