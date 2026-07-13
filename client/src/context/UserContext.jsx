import React, { createContext, useState } from 'react';

// Create a context for storing the user authentication profile and remaining credit details
export const UserContext = createContext(null);

// Create a provider component that wraps the application components
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
