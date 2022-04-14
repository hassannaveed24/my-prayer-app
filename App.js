import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Prayer from './components/Prayer';
import Maps from './components/Maps';
import { QueryClientProvider, QueryClient } from 'react-query';
const queryClient = new QueryClient();

const Drawer = createDrawerNavigator();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NavigationContainer>
                <Drawer.Navigator initialRouteName="Home">
                    <Drawer.Screen name="Home" component={Prayer} />
                    <Drawer.Screen name="Maps" component={Maps} />
                </Drawer.Navigator>
            </NavigationContainer>
        </QueryClientProvider>
    );
}
