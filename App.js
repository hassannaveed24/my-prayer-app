import React, { useState, useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { QueryClientProvider, QueryClient } from 'react-query';

import { authentication } from './database/firebaseDB';
import WithoutUserNavigation from './components/navigation/WithoutUserNavigation';
import UserNavigation from './components/navigation/UserNavigation';

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return (
    // <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      {user ? <UserNavigation /> : <WithoutUserNavigation />}
    </QueryClientProvider>
    // </Provider>
  );
}
