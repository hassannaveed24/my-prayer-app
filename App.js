import * as React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Prayer from './components/Prayer';
import Maps from './components/Maps';
import { QueryClientProvider, QueryClient } from 'react-query';
// import 'react-native-gesture-handler';
import theme from './constants/theme';
import Signup from './screens/auth/Signup';
// import Main from './screens/Main';

// import { Provider } from 'react-redux';
// import store from './store';
// import { app } from './database/firebaseDB';
// import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const queryClient = new QueryClient();

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    // <Provider store={store}>
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
    // </Provider>
  );
}
const styles = StyleSheet.create({
  signupItem: {},
  container: {},
});
