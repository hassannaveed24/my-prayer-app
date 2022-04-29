import * as React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Prayer from './components/Prayer';
import Maps from './components/Maps';
import { QueryClientProvider, QueryClient } from 'react-query';
import theme from './constants/theme';
import Signup from './screens/auth/Signup';
const queryClient = new QueryClient();

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Home"
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
  );
}
const styles = StyleSheet.create({
  signupItem: {},
  container: {},
});
