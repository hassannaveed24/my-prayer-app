import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import theme from '../../constants/theme';
import Prayer from '../../screens/home/Prayer';
import Maps from '../../screens/maps/Maps';
import PrayerTimings from '../../screens/prayerTimings/PrayerTimings';

const Drawer = createDrawerNavigator();

const UserNavigation = () => {
  return (
    <>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Prayer Time"
          screenOptions={{
            drawerActiveBackgroundColor: theme.title,
          }}>
          <Drawer.Screen name="Home" component={Prayer} />
          <Drawer.Screen name="Maps" component={Maps} />
          <Drawer.Screen name="Prayer Time" component={PrayerTimings} options={{}} />
        </Drawer.Navigator>
      </NavigationContainer>
    </>
  );
};

export default UserNavigation;
