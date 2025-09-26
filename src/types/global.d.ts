// Global type declarations for polyfills
import { Buffer } from 'buffer';
import { EventEmitter } from 'events';

declare global {
  interface Window {
    global: typeof globalThis;
    Buffer: typeof Buffer;
    EventEmitter: typeof EventEmitter;
    process: {
      env: Record<string, string | undefined>;
      nextTick: (callback: Function, ...args: any[]) => void;
      browser: boolean;
      version: string;
      versions: Record<string, string>;
    };
  }

  var global: typeof globalThis;
  var Buffer: typeof Buffer;
  var EventEmitter: typeof EventEmitter;
  var process: {
    env: Record<string, string | undefined>;
    nextTick: (callback: Function, ...args: any[]) => void;
    browser: boolean;
    version: string;
    versions: Record<string, string>;
  };
}

export {};