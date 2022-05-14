import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import theme from '../../constants/theme';
import Prayer from '../Prayer';
import Maps from '../Maps';
import Signup from '../../screens/auth/Signup';
import Signin from '../../screens/auth/Signin';

const Drawer = createDrawerNavigator();

const WithoutUserNavigation = () => {
  return (
    <>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Home"
          screenOptions={{
            drawerActiveBackgroundColor: theme.title,
          }}>
          <Drawer.Screen name="Home" component={Prayer} />
          <Drawer.Screen name="Maps" component={Maps} />
          <Drawer.Screen name="Sign Up" component={Signup} options={{}} />
          <Drawer.Screen name="Sign In" component={Signin} options={{}} />
        </Drawer.Navigator>
      </NavigationContainer>
    </>
  );
};

export default WithoutUserNavigation;
