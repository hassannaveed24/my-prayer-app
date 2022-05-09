import React, { createContext } from 'react';

const initialState = {
  user: null,
};

const AuthContext = createContext(initialState);

export default AuthContext;
