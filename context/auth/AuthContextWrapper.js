import React from 'react';
import AuthContext from './AuthContext';
import useAuthContextValue from './useAuthContextValue';

const AuthContextWrapper = ({ children }) => {
  const contextValue = useAuthContextValue();
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContextWrapper;
