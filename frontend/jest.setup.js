const originalConsoleWarn = console.warn;

// Suppress React Router v7 warnings
console.warn = (...args) => {
  if (args[0].includes('React Router Future Flag Warning:')) {
    return;
  }
  originalConsoleWarn(...args);
};
