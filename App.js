import * as React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Prayer from './components/Prayer';
import Maps from './components/Maps';
import { QueryClientProvider, QueryClient } from 'react-query';
import theme from './constants/theme';
import Signup from './screens/auth/Signup';
import Main from './screens/Main';
import * as firebase from 'firebase';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

import { Provider } from 'react-redux';
import store from './store';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  //   databaseURL: 'https://reactnativefirebase-00000.firebaseio.com',
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const queryClient = new QueryClient();

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Signup"
            screenOptions={{
              drawerActiveBackgroundColor: theme.title,
              drawerContentContainerStyle: styles.container,
            }}>
            <Drawer.Screen name="Home" component={Prayer} />
            <Drawer.Screen name="Maps" component={Maps} />
            <Drawer.Screen
              name="Signup"
              component={Signup}
              options={{
                drawerItemStyle: styles.signupItem,
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </Provider>
  );
}
const styles = StyleSheet.create({
  signupItem: {},
  container: {},
});
