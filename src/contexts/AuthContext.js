import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// Create a context to manage authentication state across the application
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store the authenticated user
  const [loading, setLoading] = useState(true); // State to track the loading status

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state when authentication changes
      setLoading(false); // Set loading to false once the auth state is determined
    });
    
    // Cleanup function to unsubscribe from auth listener when component unmounts
    return unsubscribe;
  }, []);

  return (
    // Provide authentication state and loading status to the entire app
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};