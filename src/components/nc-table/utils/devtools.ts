/**
 * DevTools compatibility utilities
 * Handles React DevTools related issues gracefully
 */

/**
 * Check if we're in development mode
 */
export const isDevelopment = () => {
  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  } catch {
    return false;
  }
};

/**
 * Check if React DevTools is available
 */
export const isReactDevToolsAvailable = () => {
  try {
    return typeof window !== 'undefined' && 
           (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== undefined;
  } catch {
    return false;
  }
};

/**
 * Safe wrapper for development-only code
 */
export const safeDevOnly = (fn: () => void) => {
  try {
    if (isDevelopment()) {
      fn();
    }
  } catch (error) {
    // Silently handle development-only errors
    console.warn('Development tool error (safe to ignore):', error);
  }
};

/**
 * Check for React version compatibility
 */
export const checkReactCompatibility = () => {
  try {
    // Try to get React version from the global React object
    const React = (window as any).React || (globalThis as any).React;
    if (React?.version) {
      const version = React.version;
      const majorVersion = parseInt(version.split('.')[0]);
      
      if (majorVersion < 18) {
        console.warn(`nc-table-react: React ${version} detected. React 18+ is recommended for best compatibility.`);
      }
      
      return { version, compatible: majorVersion >= 18 };
    }
    
    return { version: 'unknown', compatible: true };
  } catch {
    return { version: 'unknown', compatible: true };
  }
};
