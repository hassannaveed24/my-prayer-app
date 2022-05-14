import React, { useState, useEffect } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Prayer from './components/Prayer';
import Maps from './components/Maps';
import { QueryClientProvider, QueryClient } from 'react-query';
import theme from './constants/theme';
import Signup from './screens/auth/Signup';
import Signin from './screens/auth/Signin';
import PrayerTimings from './screens/prayerTimings/PrayerTimings';
import { authentication } from './database/firebaseDB';
import WithoutUserNavigation from './components/navigation/WithoutUserNavigation';
import UserNavigation from './components/navigation/UserNavigation';

const queryClient = new QueryClient();

const Drawer = createDrawerNavigator();

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
