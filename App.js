import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import prayer from './components/prayer';
import Maps from './components/maps';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

const Drawer = createDrawerNavigator();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NavigationContainer>
                <Drawer.Navigator initialRouteName="Home">
                    <Drawer.Screen name="Home" component={prayer} />
                    <Drawer.Screen name="Notifications" component={Maps} />
                </Drawer.Navigator>
            </NavigationContainer>
        </QueryClientProvider>
    );
}
