// Additional polyfill setup for browserify-sign compatibility
import { Buffer } from 'buffer';

// Ensure Buffer prototype methods are available
if (typeof Buffer !== 'undefined' && Buffer.prototype) {
  // Add slice method if missing
  if (!Buffer.prototype.slice) {
    Buffer.prototype.slice = function(start?: number, end?: number) {
      const length = this.length;
      start = start || 0;
      end = end || length;
      
      if (start < 0) start = Math.max(0, length + start);
      if (end < 0) end = Math.max(0, length + end);
      
      start = Math.min(start, length);
      end = Math.min(end, length);
      
      if (start >= end) return Buffer.alloc(0);
      
      const result = Buffer.alloc(end - start);
      for (let i = 0; i < end - start; i++) {
        result[i] = this[start + i];
      }
      return result;
    };
  }
  
  // Ensure other essential Buffer methods exist
  if (!Buffer.prototype.toString) {
    Buffer.prototype.toString = function(encoding?: string) {
      return Array.from(this).map(b => String.fromCharCode(b)).join('');
    };
  }
}

export {};