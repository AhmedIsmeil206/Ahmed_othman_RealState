import { useState, useEffect } from 'react';

// Custom hook for localStorage with encryption
const useLocalStorage = (key, initialValue, encrypt = false) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      
      if (encrypt) {
        // For encrypted data, return as is (already handled by context)
        return item;
      }
      
      return JSON.parse(item);
    } catch (error) {
return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      
      if (encrypt) {
        // For encrypted data, store as is
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
}
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
}
  };

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
